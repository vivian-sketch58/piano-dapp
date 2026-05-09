import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 2000

brands = ["Yamaha", "Kawai", "Steinway", "Bosendorfer", "Petrof", "Roland", "Casio", "Bechstein", "Fazioli", "Bluthner"]
brand_base = {"Yamaha": 4000, "Kawai": 4500, "Steinway": 25000, "Bosendorfer": 40000,
              "Petrof": 6000, "Roland": 2500, "Casio": 800, "Bechstein": 15000,
              "Fazioli": 50000, "Bluthner": 12000}

types = ["Upright", "Grand", "Baby Grand", "Digital", "Hybrid"]
type_multiplier = {"Upright": 1.0, "Grand": 3.5, "Baby Grand": 2.2, "Digital": 0.4, "Hybrid": 1.5}

conditions = ["Excellent", "Good", "Fair"]
condition_multiplier = {"Excellent": 1.0, "Good": 0.72, "Fair": 0.45}

models_by_brand = {
    "Yamaha":      ["U1", "U3", "B2", "B3", "C3", "C5", "C7", "P22", "GB1K"],
    "Kawai":       ["K-300", "K-500", "K-800", "RX-2", "RX-6", "GX-2", "GL-30", "GL-50"],
    "Steinway":    ["Model S", "Model M", "Model O", "Model L", "Model B", "Model D"],
    "Bosendorfer": ["185", "200", "214", "225", "280", "Imperial 290"],
    "Petrof":      ["P118 D1", "P122 N2", "P131 M1", "P173 Breeze", "P210 Spirit"],
    "Roland":      ["FP-30X", "FP-90X", "LX-706", "LX-708", "RD-2000", "V-Piano"],
    "Casio":       ["CDP-S100", "PX-S1100", "PX-S5000", "GP-310", "GP-510"],
    "Bechstein":   ["A 116", "B 120", "C 234", "D 282", "L 167"],
    "Fazioli":     ["F156", "F183", "F212", "F228", "F278", "F308"],
    "Bluthner":    ["Model 6", "Model 4", "Model 2", "Model 1", "Aliquot 11"],
}

rows = []
for _ in range(N):
    brand = np.random.choice(brands)
    model = np.random.choice(models_by_brand[brand])
    piano_type = np.random.choice(types, p=[0.40, 0.15, 0.20, 0.18, 0.07])
    condition = np.random.choice(conditions, p=[0.35, 0.45, 0.20])
    year = int(np.random.randint(1970, 2024))
    age = 2024 - year
    age_depreciation = max(0.3, 1.0 - age * 0.012)

    base = brand_base[brand]
    price = (base
             * type_multiplier[piano_type]
             * condition_multiplier[condition]
             * age_depreciation
             * np.random.uniform(0.85, 1.15))
    price = max(300, round(price, 2))

    rows.append({
        "brand": brand,
        "model": model,
        "type": piano_type,
        "year_made": year,
        "condition": condition,
        "age": age,
        "price_usd": price,
    })

df = pd.DataFrame(rows)
out_path = os.path.join(os.path.dirname(__file__), "../data/piano_prices.csv")
df.to_csv(out_path, index=False)
print(f"Generated {len(df)} rows -> {out_path}")
print(df.describe())
print(df.head())
