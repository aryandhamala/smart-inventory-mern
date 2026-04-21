import sys
import pandas as pd
import joblib
from datetime import datetime
import json

if len(sys.argv) < 3:
    print(json.dumps({"error": "Usage: python predict.py <store> <item> [days]"}))
    sys.exit(1)

store = int(sys.argv[1])
item = int(sys.argv[2])
days = int(sys.argv[3]) if len(sys.argv) > 3 else 7

model = joblib.load("models/demand_model.pkl")

today = datetime.now()
rows = []

for i in range(days):
    future_date = today + pd.Timedelta(days=i + 1)
    rows.append({
        "store": store,
        "item": item,
        "year": future_date.year,
        "month": future_date.month,
        "day": future_date.day,
        "dayofweek": future_date.weekday()
    })

future_df = pd.DataFrame(rows)
predictions = model.predict(future_df)
predictions = [max(0, round(float(x), 2)) for x in predictions]

result = {
    "store": store,
    "item": item,
    "days": days,
    "dailyForecast": predictions,
    "totalForecast": round(sum(predictions), 2)
}

print(json.dumps(result))