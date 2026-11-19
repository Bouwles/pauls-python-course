---
id: pips
type: pips
title: Fix Riya's version
files: [dials.py]
entry: dials.py
timeout_ms: 20000
dialogue:
  - riya.pleased: "Can you look? SelectKBest picked the ten of three hundred dials that know, then I cross-validated and got eighty-two per cent."
  - aaesha.unimpressed: "Seven of your ten are on the boiler, Riya."
dialogue_after:
  - riya.surprised: "It was three hundred dials of nothing, I found ten that looked like something, then marked them with the answers."
  - paul.neutral.point: "Choosing the columns counts as learning too, which means it has to go inside the fold with everything else."
hints:
  nudge: "When Riya's chooser picked the ten dials, which nights' answers did it look at? Which of those nights is each fold scored on?"
  plan:
    - Import make_pipeline
    - Make one model that chooses the dials, then fits LogisticRegression
    - Cross-validate that model on all the readings
  shape: |
    model = make_pipeline(SelectKBest(f_classif, k=___), LogisticRegression())
    scores = cross_val_score(___, ___, usable, cv=5)
---
The Clocktower's old control panel logs every dial in the building, 300 of them, from the clock's gears to the boiler, for 80 nights, with whether each night was usable for the telescope. Riya's program chooses 10 dials with `SelectKBest(f_classif, k=10)`, which keeps the 10 columns that best match the answers, then cross-validates.

Choosing columns learns from the answers, like scaling learns means. Run Riya's program, then make its score honest. The checks try other numbers of dials, and look for the chooser in a pipeline.
