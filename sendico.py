from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
import uvicorn

app = FastAPI(title="Multi-Store Product Scraper API")

# ---------------------------------------------------------
# CORE SCRAPING FUNCTIONS
# ---------------------------------------------------------

def fetch_html(target_url: str, api_key: str) -> Optional[str]:
    """
    Helper to fetch HTML via ScraperAPI.
    """
    payload = {
        'api_key': api_key,
        'url': target_url
    }
    try:
        # Timeout set to 60s to allow ScraperAPI enough time
        r = requests.get('https://api.scraperapi.com/', params=payload, timeout=60)
        if r.status_code == 200:
            return r.text
    except Exception as e:
        print(f"Error fetching {target_url}: {e}")
    return None

def parse_amazon(html: str, domain_prefix: str) -> List[dict]:
    """
    Parses Amazon HTML for .in, .co.jp, etc.
    """
    soup = BeautifulSoup(html, 'html.parser')
    results = []

    for item in soup.select('div.s-result-item[data-component-type="s-search-result"]'):
        # 1. Name
        title_el = (
            item.select_one('h2 span.a-size-base-plus') or
            item.select_one('h2 span.a-size-base') or
            item.select_one('h2 span')
        )
        name = title_el.get_text(strip=True) if title_el else "Unknown Product"

        # 2. Link
        link_el = item.select_one('a.a-link-normal.s-no-outline') or item.select_one('a.a-link-normal')
        link = link_el['href'] if link_el else None
        if link and link.startswith('/'):
            link = domain_prefix + link

        # 3. Image
        img_el = item.select_one('img.s-image')
        image = img_el['src'] if img_el else None

        # 4. Summary (Price + Rating)
        whole = item.select_one('span.a-price-whole')
        fraction = item.select_one('span.a-price-fraction')
        symbol = item.select_one('span.a-price-symbol')
        
        price_str = "N/A"
        if whole:
            p_text = whole.get_text(strip=True)
            f_text = fraction.get_text(strip=True) if fraction else ""
            s_text = symbol.get_text(strip=True) if symbol else ""
            price_str = f"{s_text}{p_text}.{f_text}" if f_text else f"{s_text}{p_text}"

        rating_el = item.select_one('span.a-icon-alt')
        rating = rating_el.get_text(strip=True) if rating_el else "No rating"
        
        summary = f"Price: {price_str} | Rating: {rating}"

        if link:
            results.append({
                "source": domain_prefix,
                "name": name,
                "summary": summary,
                "image": image,
                "link": link
            })
    return results

def parse_flipkart(html: str) -> List[dict]:
    """
    Parses Flipkart HTML.
    """
    soup = BeautifulSoup(html, 'html.parser')
    results = []
    
    # Select common container classes for Flipkart search results
    cards = soup.select('div._1AtVbE') 
    
    for card in cards:
        # Title (Try both list view and grid view classes)
        name_el = card.select_one('div._4rR01T') or card.select_one('a.s1Q9rs')
        if not name_el: 
            continue 
        name = name_el.get_text(strip=True)
        
        # Link
        link_el = card.select_one('a._1fQZEK') or card.select_one('a.s1Q9rs')
        link = link_el['href'] if link_el else None
        if link and link.startswith('/'):
            link = 'https://www.flipkart.com' + link

        # Image
        img_el = card.select_one('img._396cs4')
        image = img_el['src'] if img_el else None

        # Summary (Price + Specs)
        price_el = card.select_one('div._30jeq3')
        price = price_el.get_text(strip=True) if price_el else "N/A"
        
        specs_el = card.select('ul._1xgFaf li')
        specs_text = ", ".join([s.get_text(strip=True) for s in specs_el[:3]])
        
        summary = f"Price: {price}"
        if specs_text:
            summary += f" | Specs: {specs_text}"

        results.append({
            "source": "https://www.flipkart.com",
            "name": name,
            "summary": summary,
            "image": image,
            "link": link
        })
        
    return results

# ---------------------------------------------------------
# FASTAPI ENDPOINTS
# ---------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Scraper API is running. Go to /search to find products."}

@app.get("/search")
def search_products(
    q: str = Query(..., description="The product name to search for (e.g., 'Seiko 5')"),
    api_key: str = Query(..., description="Your ScraperAPI Key")
):
    """
    Searches for a product on Amazon.in, Amazon.co.jp, and Flipkart.
    """
    if not q:
        raise HTTPException(status_code=400, detail="Query string 'q' cannot be empty.")

    combined_results = []

    # 1. Scrape Amazon Japan
    url_jp = f'https://www.amazon.co.jp/s?k={q}'
    html_jp = fetch_html(url_jp, api_key)
    if html_jp:
        combined_results.extend(parse_amazon(html_jp, 'https://www.amazon.co.jp'))

    # 2. Scrape Amazon India
    url_in = f'https://www.amazon.in/s?k={q}'
    html_in = fetch_html(url_in, api_key)
    if html_in:
        combined_results.extend(parse_amazon(html_in, 'https://www.amazon.in'))

    # 3. Scrape Flipkart
    url_fk = f'https://www.flipkart.com/search?q={q}'
    html_fk = fetch_html(url_fk, api_key)
    if html_fk:
        combined_results.extend(parse_flipkart(html_fk))

    return {
        "query": q,
        "total_results": len(combined_results),
        "products": combined_results
    }

# ---------------------------------------------------------
# RUNNER (For direct script execution)
# ---------------------------------------------------------
if __name__ == "__main__":
    # You can run this file directly with python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)