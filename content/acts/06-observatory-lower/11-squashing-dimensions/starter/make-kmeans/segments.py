"""Customer Segmentation: a wholesaler's 440 customers sorted into groups by
what they spend on, with k-means written from scratch.

GOODS                       the six kinds of goods, in column order
load_customers(path)        (spending, channels): spending is an (n, 6) array
                            of a year's spending on GOODS; channels is an array
                            of "horeca" or "retail" (written for you)
prepare(spending)           the log of the spending, then each column
                            standardised to mean 0 and spread 1
initial_centres(points, k, rng)
                            k different customers to start from, picked with
                            rng.choice(len(points), size=k, replace=False)
assign(points, centres)     for each customer, the position of its nearest
                            centre
update(points, labels, centres)
                            each centre moved to the mean of its customers; a
                            centre with none stays where it was
inertia(points, labels, centres)
                            the sum of the squared distances from each
                            customer to its own centre
k_means(points, k, rng, max_steps=100)
                            (centres, labels, history): assign and update
                            until nothing changes, or max_steps assignments;
                            history holds the inertia after each assignment
best_of(points, k, tries, rng)
                            (centres, labels, inertia): the best of tries runs
choose_k(inertias)          the smallest k for which one more group cuts the
                            inertia by less than a quarter, or the largest k
Run as a program, it prepares the spending, tries k from 1 to 8 (the best of
10 runs each, rng = np.random.default_rng(10)), chooses k, describes each
segment, and checks against scikit-learn:
k   inertia
1    2640.0
2    1848.0
3    1558.0
4    1391.9
5    1272.8
6    1182.7
7    1102.7
8    1032.1
Chosen k: 2
Segment 1: 251 customers, 3% retail, above average on fresh, frozen
Segment 2: 189 customers, 71% retail, above average on milk, grocery, detergents_paper, delicatessen
scikit-learn agrees: True
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

GOODS = ["fresh", "milk", "grocery", "frozen", "detergents_paper", "delicatessen"]


def load_customers(path):
    customers = pd.read_csv(path)
    return customers[GOODS].to_numpy(dtype=float), customers["channel"].to_numpy()


if __name__ == "__main__":
    spending, channels = load_customers("customers.csv")
    points = prepare(spending)
    rng = np.random.default_rng(10)

    # Try every k, best of 10

    # Choose k at the elbow, and describe each segment, biggest first

    # Check against scikit-learn
