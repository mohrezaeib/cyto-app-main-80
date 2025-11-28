# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
from filters import CompoundFilter, FilterParams

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)
CORS(app)

# # Load data.json
# DATA_PATH = os.path.join("static", "data.json")
# with open(DATA_PATH, "r", encoding="utf-8") as f:
#     data = json.load(f)

# app.py - Updated data loading section
try:
    DATA_PATH = os.path.join("static", "data.json")
    print(f"Looking for data at: {DATA_PATH}")

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at: {DATA_PATH}")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Successfully loaded {len(data)} compounds")

except Exception as e:
    logging.error(f"Error loading data: {str(e)}")
    # Create empty data to prevent crashes
    data = []
    print("Using empty data array due to loading error")
# Initialize filter
compound_filter = CompoundFilter()


@app.route("/")
def hello():
    return jsonify({"message": "Flask backend is running", "status": "ok"})


@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "data_loaded": len(data)})


@app.route("/api/items")
def api_items():
    try:
        # Parse query parameters
        params = FilterParams(
            query=request.args.get("query", "").strip(),
            page=max(1, request.args.get("page", default=1, type=int)),
            per_page=request.args.get("per_page", default=20, type=int),
            min_molweight=request.args.get("min_molweight", type=float),
            max_molweight=request.args.get("max_molweight", type=float),
            min_ic50=request.args.get("min_ic50", type=float),
            max_ic50=request.args.get("max_ic50", type=float),
            activity=request.args.get("activity"),
            reversibility=request.args.get("reversibility"),
            quantity_type=request.args.get("quantity_type"),
            min_quantity=request.args.get("min_quantity", type=float),
            max_quantity=request.args.get("max_quantity", type=float),
            selected_fields=request.args.getlist("fields")
        )

        logging.debug("API /api/items called with params: %s", params)

        # Apply filters
        filtered_data = compound_filter.filter_compounds(data, params)

        # Paginate results
        total_items = len(filtered_data)
        total_pages = (total_items + params.per_page - 1) // params.per_page
        start_index = (params.page - 1) * params.per_page
        end_index = start_index + params.per_page
        paginated_items = filtered_data[start_index:end_index]

        return jsonify({
            "items": paginated_items,
            "page": params.page,
            "per_page": params.per_page,
            "total_pages": total_pages,
            "total_items": total_items
        })

    except Exception as e:
        logging.error("Error in /api/items: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500


@app.get("/api/item/<int:mol_idx>")
def api_item_detail(mol_idx: int):
    try:
        item = next((item for item in data if item.get("mol_idx") == mol_idx), None)
        if not item:
            return jsonify({"error": "Compound not found"}), 404

        # Find previous/next indexes
        current_index = next((i for i, item in enumerate(data) if item.get("mol_idx") == mol_idx), None)

        prev_idx = data[current_index - 1]["mol_idx"] if current_index and current_index > 0 else None
        next_idx = data[current_index + 1]["mol_idx"] if current_index and current_index < len(data) - 1 else None

        return jsonify({
            "item": {
                "mol_idx": item.get("mol_idx"),
                "fields": item.get("fields", {}),
                "base64_png": item.get("base64_png"),
            },
            "prev_idx": prev_idx,
            "next_idx": next_idx,
        })

    except Exception as e:
        logging.error("Error in /api/item/%s: %s", mol_idx, str(e))
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=443, debug=False)  # <-- bind to all interfaces
