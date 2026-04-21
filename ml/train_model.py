import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

print("Loading dataset...")

df = pd.read_csv("data/store_inventory_demand.csv")

# Clean column names
df.columns = df.columns.str.strip().str.lower()

print("Columns found:", df.columns.tolist())

# Ensure date column is datetime
df["date"] = pd.to_datetime(df["date"])

# Feature engineering
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day
df["dayofweek"] = df["date"].dt.dayofweek

features = ["store", "item", "year", "month", "day", "dayofweek"]

# target column
target = "sales"

if target not in df.columns:
    raise Exception(f"Target column '{target}' not found. Available columns: {df.columns.tolist()}")

X = df[features]
y = df[target]

print("Splitting dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print("Training RandomForest model...")

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=12,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("Model trained")

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)

print("Model MAE:", mae)

# Save model
joblib.dump(model, "models/demand_model.pkl")

print("Model saved successfully")