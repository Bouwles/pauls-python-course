---
id: learn-elbow
type: learn
title: How many groups?
concept: k-means
code: |
  inertias = [2640.0, 1848.0, 1558.0, 1391.9, 1272.8]     # for k = 1, 2, 3, 4, 5

  for k in range(1, len(inertias)):
      cut = 1 - inertias[k] / inertias[k - 1]
      print(f"From {k} to {k + 1} groups: inertia falls {cut:.0%}")
---
More groups always make tighter groups. With one group per customer, the inertia is 0, and you've learnt nothing. So the lowest inertia can't choose `k`.

Instead, look at what each extra group buys. Plotted against `k`, the inertia falls steeply at first, then levels off, like an arm bent at the **elbow**. Choose `k` at the bend, where one more group stops paying for itself.

Yahya's rule makes the bend exact: choose the smallest `k` for which one more group cuts the inertia by less than a quarter. The example uses the wholesaler's real inertias. Going from 1 to 2 groups cuts 30%; from 2 to 3, only 16%. So `k` is 2.

The usual mistake is choosing the `k` with the lowest inertia, which is always the biggest.
