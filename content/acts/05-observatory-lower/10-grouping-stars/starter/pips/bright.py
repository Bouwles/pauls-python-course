# Pip's bright star sorter. Twenty-four stars, four groups, any seed you like.
import numpy as np

K = 4
SEED = 11

stars = np.loadtxt("bright.csv", delimiter=",", skiprows=1)[:, 1:3]
rng = np.random.default_rng(SEED)

# Start from K stars, picked at random
centres = stars[rng.choice(len(stars), size=K)]

for step in range(20):
    distances = np.linalg.norm(stars[:, np.newaxis, :] - centres[np.newaxis, :, :], axis=2)
    labels = distances.argmin(axis=1)
    centres = np.array([stars[labels == j].mean(axis=0) for j in range(K)])

sizes = sorted(np.bincount(labels, minlength=K).tolist(), reverse=True)
spread = np.sum((stars - centres[labels]) ** 2)
print(f"Group sizes: {sizes}")
print(f"Inertia: {spread:.1f}")
