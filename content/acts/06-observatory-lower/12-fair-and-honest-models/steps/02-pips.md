---
id: pips
type: pips
title: Pip's Version
files: [dials.py]
entry: dials.py
timeout_ms: 20000
dialogue:
  - pip: "Three hundred dials. I let SelectKBest pick the ten that know, then cross-validated. Eighty-two per cent."
  - wendt: "Seven of your ten are on the boiler, Pip."
dialogue_after:
  - pip: "Three hundred dials of nothing, and I found ten that looked like something. Then I marked them with the answers."
  - moss: "Choosing is learning. It goes inside the fold, with the rest of it."
hints:
  nudge: "When Pip's chooser picked the ten dials, which nights' answers did it look at? Which of those nights is each fold scored on?"
  plan:
    - Import make_pipeline
    - Make one model that chooses the dials, then fits LogisticRegression
    - Cross-validate that model on all the readings
  shape: |
    model = make_pipeline(SelectKBest(f_classif, k=___), LogisticRegression())
    scores = cross_val_score(___, ___, usable, cv=5)
---
Penhallow wired every dial in the building into one log: 300 of them, from the dome motors to the boiler, for 80 nights, with whether each night was usable. `SelectKBest(f_classif, k=10)` keeps the 10 columns that best match the answers.

Run Pip's program, then make its score honest. The checks try other numbers of dials, and look for the chooser in a pipeline.
