import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/piano_prices.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")

df = pd.read_csv(DATA_PATH)

features = ["brand", "type", "condition", "year_made", "age"]
target = "price_usd"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

cat_features = ["brand", "type", "condition"]
num_features = ["year_made", "age"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
    ("num", StandardScaler(), num_features),
])

model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)),
])

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MAE: ${mae:,.2f}")
print(f"R2:  {r2:.4f}")

joblib.dump(model, MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")
