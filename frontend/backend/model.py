import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "cost_model.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "label_encoders.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model_metrics.pkl")


def train_cost_model(master):
    """
    Train a Random Forest model to predict TOTAL_CLAIM_COST per encounter.

    Features used:
        - AGE (numeric)
        - GENDER (encoded)
        - COVERAGE_LEVEL (encoded)
        - PAYER_NAME (encoded)
        - ENCOUNTERCLASS (encoded)
        - YEAR (numeric)
        - MONTH (numeric)

    Target: TOTAL_CLAIM_COST
    """

    print(" Preparing features for ML model...")

    # Select features and target
    feature_cols = ["AGE", "GENDER", "COVERAGE_LEVEL", "PAYER_NAME", "ENCOUNTERCLASS", "YEAR", "MONTH"]
    target_col = "TOTAL_CLAIM_COST"

    # Drop rows with missing values in feature/target columns
    df = master[feature_cols + [target_col]].dropna()

    # Label encode categorical features
    label_encoders = {}
    categorical_cols = ["GENDER", "COVERAGE_LEVEL", "PAYER_NAME", "ENCOUNTERCLASS"]

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    X = df[feature_cols]
    y = df[target_col]

    # Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples:  {len(X_test)}")

    # Train Random Forest
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f" Model trained successfully!")
    print(f"   R² Score:           {r2:.4f} ({r2 * 100:.1f}% accuracy)")
    print(f"   Mean Absolute Error: ${mae:.2f}")

    # Feature importance
    importances = dict(zip(feature_cols, model.feature_importances_))
    print(f"   Feature importances: {importances}")

    # Save model, encoders, and true test-set metrics
    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoders, ENCODERS_PATH)
    joblib.dump({"r2": r2, "mae": mae}, METRICS_PATH)
    print(f"   Model saved to {MODEL_PATH}")

    # Calculate year-over-year trend
    yearly_avg = master.groupby("YEAR")["TOTAL_CLAIM_COST"].mean().sort_index()
    if len(yearly_avg) >= 2:
        last_two = yearly_avg.tail(2)
        yoy_change = ((last_two.iloc[-1] - last_two.iloc[-2]) / last_two.iloc[-2]) * 100
    else:
        yoy_change = 0.0

    return {
        "r2_score": round(r2, 4),
        "accuracy_percent": round(r2 * 100, 1),
        "mae": round(mae, 2),
        "feature_importances": {k: round(v, 4) for k, v in importances.items()},
        "yoy_change_percent": round(yoy_change, 1),
    }


def predict_cost(master, filters=None):
    """
    Generate predicted cost per visit for the filtered data context.

    Returns predicted average cost, model accuracy, and trend.
    """

    # Load model and encoders
    if not os.path.exists(MODEL_PATH):
        return {"error": "Model not trained yet. Train the model first."}

    model = joblib.load(MODEL_PATH)
    label_encoders = joblib.load(ENCODERS_PATH)

    # Prepare prediction features from the filtered data context
    feature_cols = ["AGE", "GENDER", "COVERAGE_LEVEL", "PAYER_NAME", "ENCOUNTERCLASS", "YEAR", "MONTH"]
    df = master[feature_cols + ["TOTAL_CLAIM_COST"]].dropna().copy()

    if len(df) == 0:
        return {"predicted_cost": 0, "accuracy": 0, "trend_percent": 0}

    # Encode categorical features using saved encoders
    categorical_cols = ["GENDER", "COVERAGE_LEVEL", "PAYER_NAME", "ENCOUNTERCLASS"]
    for col in categorical_cols:
        le = label_encoders[col]
        # Handle unseen labels gracefully
        df[col] = df[col].astype(str).apply(
            lambda x: le.transform([x])[0] if x in le.classes_ else -1
        )

    X = df[feature_cols]
    predictions = model.predict(X)

    predicted_avg = float(np.mean(predictions))
    actual_avg = float(df["TOTAL_CLAIM_COST"].mean())

    # Calculate year-over-year trend from actual data
    yearly_avg = master.groupby("YEAR")["TOTAL_CLAIM_COST"].mean().sort_index()
    if len(yearly_avg) >= 2:
        last_two = yearly_avg.tail(2)
        yoy_change = ((last_two.iloc[-1] - last_two.iloc[-2]) / last_two.iloc[-2]) * 100
    else:
        yoy_change = 0.0

    # Use the TRUE test-set R² from training (not recalculated on all data)
    saved_metrics = joblib.load(METRICS_PATH)
    r2 = saved_metrics["r2"]

    return {
        "predicted_cost": round(predicted_avg, 2),
        "actual_avg_cost": round(actual_avg, 2),
        "accuracy_percent": round(max(r2 * 100, 0), 1),
        "trend_percent": round(yoy_change, 1),
        "trend_direction": "up" if yoy_change > 0 else "down",
    }