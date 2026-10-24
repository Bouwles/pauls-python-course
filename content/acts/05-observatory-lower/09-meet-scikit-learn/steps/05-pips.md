---
id: pips
type: pips
title: Pip's Version
files: [neighbours.py]
entry: neighbours.py
timeout_ms: 20000
dialogue:
  - pip: "Nearest Neighbours took me a week by hand. In scikit-learn it's two lines."
  - pip: "It's worse than always saying no. So k-NN is rubbish. Science."
dialogue_after:
  - pip: "Visibility is in metres. Tens of thousands of them. Nobody else got a say."
  - moss: "A ruler for each reading. You knew that in the frost forecast."
hints:
  nudge: "Visibility is in metres, cloud in eighths of the sky. Which one decides who counts as a near neighbour?"
  plan:
    - Import make_pipeline and StandardScaler
    - Make the model a pipeline that scales, then asks the neighbours
    - Leave cross_val_score and everything else alone
  shape: |
    from sklearn.pipeline import ___
    from sklearn.preprocessing import ___

    model = make_pipeline(___(), KNeighborsClassifier(n_neighbors=NEIGHBOURS))
---
Pip cross-validates a k-NN on Penhallow's seeing log: 320 evenings of cloud (eighths of the sky), humidity, wind, pressure and visibility in metres, and whether the night was usable. Run it.

Fix it, so the k-NN gets a fair look at every reading. The checks try other numbers of neighbours, and they look at `model` itself.
