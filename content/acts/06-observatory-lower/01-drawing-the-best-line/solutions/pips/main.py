import numpy as np
import pandas as pd

houses = pd.read_csv("king_county_houses.csv")
areas = houses["area_m2"].to_numpy(dtype=float)
prices = houses["price"].to_numpy(dtype=float)

# Walk in hundreds of square metres, so a rate of 0.1 is safe
hundreds = areas / 100
w, b = 0.0, 0.0
for step in range(2000):
    miss = w * hundreds + b - prices
    w = w - 0.1 * 2 * np.mean(miss * hundreds)
    b = b - 0.1 * 2 * np.mean(miss)

area = 150.0
price = w * (area / 100) + b
print(f"A house of {area:g} square metres: about ${round(price, -3):,.0f}")
