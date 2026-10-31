# Caitlin's squasher. Six kinds of goods in, the shares of the variance out.
import numpy as np
import pandas as pd

GOODS = ["fresh", "milk", "grocery", "frozen", "detergents_paper", "delicatessen"]

logged = np.log(pd.read_csv("customers.csv")[GOODS].to_numpy(dtype=float))

centred = logged - logged.mean(axis=0)
spread = centred.T @ centred / (len(logged) - 1)
values, vectors = np.linalg.eigh(spread)
values = values[::-1]

shares = values / values.sum()
print("First three shares:", np.round(shares[:3], 3))
