import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from data_processor import load_and_process_data, get_filter_options, apply_filters, compute_dashboard_data
from model import train_cost_model, predict_cost
import pandas as pd

app = Flask(__name__)

# CORS: Allow frontend origins (local + production)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
CORS(app, origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# ── Load data and train model on startup ───────────────────────

print("Starting Hospital Dashboard Backend...")


master_df = load_and_process_data()
organizations_df = pd.read_csv(os.path.join(DATA_DIR, "organizations.csv"))

print("\n Training cost prediction model...")
model_metrics = train_cost_model(master_df)
print(f"  Model metrics: {model_metrics}")
print("=" * 60)


# ── API Endpoints ──────────────────────────────────────────────

@app.route("/api/filters", methods=["GET"])
def get_filters():
    options = get_filter_options(master_df)
    return jsonify(options)


@app.route("/api/dashboard", methods=["POST"])
def get_dashboard_data():
    filters = request.get_json() or {}
    filtered_df = apply_filters(master_df, filters)
    dashboard = compute_dashboard_data(filtered_df)
    prediction = predict_cost(filtered_df, filters)
    dashboard["prediction"] = prediction
    dashboard["model_metrics"] = model_metrics
    return jsonify(dashboard)


@app.route("/api/predict", methods=["POST"])
def get_prediction():
    filters = request.get_json() or {}
    filtered_df = apply_filters(master_df, filters)
    prediction = predict_cost(filtered_df, filters)
    prediction["model_metrics"] = model_metrics
    return jsonify(prediction)




@app.route("/api/cities", methods=["GET"])
def get_cities():
    cities = master_df.groupby("PATIENT_CITY").agg(
        lat=("PATIENT_LAT", "first"),
        lon=("PATIENT_LON", "first"),
        patient_count=("PATIENT", "nunique"),
    ).reset_index()
    cities = cities.sort_values("PATIENT_CITY")
    result = []
    for _, row in cities.iterrows():
        result.append({
            "city": row["PATIENT_CITY"],
            "lat": round(float(row["lat"]), 4),
            "lon": round(float(row["lon"]), 4),
        })
    return jsonify(result)


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "total_records": len(master_df),
        "model_trained": True,
        "model_accuracy": model_metrics.get("accuracy_percent", 0),
    })


@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Hospital Dashboard API",
        "endpoints": [
            "GET  /api/health",
            "GET  /api/filters",
            "GET  /api/cities",
            "POST /api/dashboard",
            "POST /api/predict",
            "POST /api/match",
        ]
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
