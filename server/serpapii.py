from flask import Flask, request, jsonify
from google_search_results import GoogleSearch

app = Flask(__name__)



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
