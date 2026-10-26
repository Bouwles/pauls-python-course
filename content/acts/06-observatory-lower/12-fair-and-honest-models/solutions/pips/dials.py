# Pip's dial finder. Three hundred dials, and I found the ones that know.
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

DIALS = 10

log = np.loadtxt("dials.csv", delimiter=",", skiprows=1)
readings = log[:, 1:-1]
usable = log[:, -1].astype(int)

# Keep the dials that best match the usable nights: inside each fold
model = make_pipeline(SelectKBest(f_classif, k=DIALS), LogisticRegression())

scores = cross_val_score(model, readings, usable, cv=5)
print(f"The {DIALS} best dials, cross-validated: {scores.mean():.2f}")
print(f"Always saying no: {np.mean(usable == 0):.2f}")
