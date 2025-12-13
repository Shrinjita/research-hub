# server/serp_combined.py
from flask import Flask, request, jsonify
from serpapi import GoogleSearch
import os

app = Flask(__name__)
SERPAPI_KEY = os.environ.get("SERPAPI_KEY") or "<YOUR_KEY>"

# -----------------------
# Search papers by query
# -----------------------
@app.route("/scholar/search", methods=["GET"])
def scholar_search():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing query parameter q"}), 400

    params = {
        "engine": "google_scholar",
        "q": query,
        "hl": "en",
        "num": 10,
        "api_key": SERPAPI_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    research_items = []
    for item in results.get("organic_results", []):
        research_items.append({
            "title": item.get("title"),
            "link": item.get("link")
        })

    response = {
        "query": results.get("search_information", {}).get("query_displayed"),
        "total_results": results.get("search_information", {}).get("total_results"),
        "research_items": research_items
    }
    return jsonify(response)


# -----------------------
# Get papers by author_id
# -----------------------
@app.route("/scholar/author", methods=["GET"])
def scholar_author():
    author_id = request.args.get("author_id")
    if not author_id:
        return jsonify({"error": "Missing author_id"}), 400

    params = {
        "engine": "google_scholar_author",
        "author_id": author_id,
        "hl": "en",
        "api_key": SERPAPI_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    return jsonify(results)


if __name__ == "__main__":
    app.run(port=8000, debug=True)
