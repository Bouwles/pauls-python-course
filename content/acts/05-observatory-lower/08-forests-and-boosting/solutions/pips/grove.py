# Pip's forest. Fifty trees, every one of them deep. Fifty.
import numpy as np

from tools import load_table, train_test_split
from tree import fit_tree, predict_tree

X, seeing = load_table("seeing.csv")
X_train, X_test, y_train, y_test = train_test_split(X, seeing, 0.25, np.random.default_rng(8))


def fit_forest(X, y, n_trees=50, seed=8):
    """n_trees deep trees, each grown on its own bootstrap sample."""
    trees = []
    rng = np.random.default_rng(seed)
    for i in range(n_trees):
        rows = rng.integers(0, len(X), len(X))
        trees.append(fit_tree(X[rows], y[rows], max_depth=8, max_features=2, rng=rng))
    return trees


def predict_forest(trees, X):
    return np.mean([predict_tree(tree, X) for tree in trees], axis=0)


if __name__ == "__main__":
    tree = fit_tree(X_train, y_train, max_depth=8)
    forest = fit_forest(X_train, y_train)
    print(f"One deep tree:       {np.mean((predict_tree(tree, X_test) - y_test) ** 2):.4f}")
    print(f"Forest of 50 trees:  {np.mean((predict_forest(forest, X_test) - y_test) ** 2):.4f}")
