# Pip's k-NN, in scikit-learn. A week from scratch. Two lines here.
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

NEIGHBOURS = 15

evenings = np.loadtxt("seeing.csv", delimiter=",", skiprows=1)
X = evenings[:, 1:6]
usable = evenings[:, 6].astype(int)

model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=NEIGHBOURS))
scores = cross_val_score(model, X, usable, cv=5)

print(f"k-NN, {NEIGHBOURS} neighbours: {scores.mean():.3f}")
print(f"Always saying no: {np.mean(usable == 0):.3f}")
