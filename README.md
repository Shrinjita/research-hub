# Taskoscope – AI-Powered Research & Shopping Assistant

It is a full-stack web application that combines academic research assistance with e-commerce product exploration.

* **ResearchMode:** Quickly searches and summarizes research papers, extracts citations, and generates literature surveys.
* **ShoppingMode:** Aggregates product information across multiple online stores (Amazon India/Japan, Flipkart), providing price, image, and link summaries.
* **FocusMode:** Coming Soon
The platform integrates multiple APIs for scraping, summarization, and citation extraction, with preemptive templates for speed and reliability.

---

## **Key Features**

### **ResearchMode**

* Google Scholar search by topic or author ID.
* Summarization of papers using Gemini API (fallback templates available).
* Citation extraction and literature survey generation.
* Tab-based interface for organizing multiple topics simultaneously.
* Support for pre-fetched links and offline-ready research summaries.

### **ShoppingMode**

* Multi-store product search using ScraperAPI.
* Aggregates product details including price, image, and link.
* Fast results with preemptive template summaries.
* Easy addition of custom product URLs.

### **Reliability Features**

* Fallback templates ensure immediate summaries and citations if APIs fail.
* Default mode uses offline-ready research summaries to maintain workflow.
* Supports multiple backends without port conflicts.

---

## **Tech Stack**

**Frontend**

* React + TypeScript
* Tailwind CSS
* Lucide-react icons

**Backend**

* Flask (Python) – Scholar API, default research summaries
* FastAPI (Python) – ShoppingMode API
* Node.js + Express – SERPAPI endpoints for scholar search

**APIs**

* [SerpAPI](https://serpapi.com/) – Google Scholar & author lookup
* [ScraperAPI](https://www.scraperapi.com/) – Product scraping from e-commerce sites
* Gemini & OLAMA (planned) – Summarization & citation extraction

---

## **Installation**

### **Clone the repository**

```bash
git clone <repo-url>
cd research-hub
```

### **Install frontend dependencies**

```bash
npm install
```

### **Start frontend**

```bash
npm run dev
```

### **Set up backend**

* **Python virtual environment** (recommended)

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

* **Set environment variables**

```bash
export SERPAPI_KEY=<your_serpapi_key>
export SCRAPERAPI_KEY=<your_scraperapi_key>
```

### **Start backends**

```bash
# Flask default research API
python server/serp.py

# Flask Google Scholar author API
python server/serpapii.py

# FastAPI Shopping API
python sendico.py
```

> **Note:** Ensure no port conflicts. Default ports:
>
> * Research (Flask): 8002
> * Scholar Author (Flask): 8000
> * Shopping (FastAPI): 8000/8001 (adjust if needed)

---

## **Usage**

### **ResearchMode**

1. Open the app in the browser (`localhost:5173`).
2. Enter a topic or paste a Google Scholar link.
3. Click **Add Research Tab**.
4. Use **Summarize** to get preemptive summary or Gemini-generated summary.
5. Click **Extract Citations** to fetch citations (fallback templates if API fails).
6. Generate a **Literature Survey** from selected tabs.

### **ShoppingMode**

1. Enter product name or URL.
2. Click search to fetch aggregated product information.
3. View summarized price, image, and link details.

---

## **File Structure**

```
src/
  pages/
    ResearchMode.tsx       # Research UI
    ShoppingMode.tsx       # Shopping UI
  services/
    researchApi.ts         # API calls for ResearchMode
    shoppingApi.ts         # API calls for ShoppingMode
server/
  serp.py                  # Flask Scholar search API (default)
  serpapii.py              # Flask Scholar author API
  sendico.py               # FastAPI Shopping API
```

---

## **Backend API Endpoints**

### **ResearchMode**

| Endpoint          | Method | Description                        |
| ----------------- | ------ | ---------------------------------- |
| `/scholar/search` | GET    | Google Scholar search by query     |
| `/scholar/author` | GET    | Google Scholar author lookup by ID |

### **ShoppingMode**

| Endpoint  | Method | Description                                   |
| --------- | ------ | --------------------------------------------- |
| `/search` | GET    | Scrapes Amazon India/Japan, Flipkart products |
| `/custom` | POST   | Search custom URLs or product pages           |

---

## **Fallback & Default Behavior**

* **Fallback summaries** ensure smooth workflow when Gemini or OLAMA APIs are unavailable.
* **Preempted templates** reduce response time.
* Default research summaries are stored offline in **MOCK_SUMMARY**, **MOCK_CITATIONS**, and **MOCK_LIT_SURVEY**.

---

## **Future Enhancements**

* Full OLAMA / HuggingFace integration for instant summarization.
* Automated citation validation and link checking.
* Unified backend with merged Flask + FastAPI services.
* Improved ShoppingMode analytics and multi-store comparison charts.

