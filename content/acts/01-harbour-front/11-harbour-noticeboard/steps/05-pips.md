---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I've done the censor for Agnes. It runs very fast."
  - pip: "It doesn't censor anything yet. But it's very fast."
dialogue_after:
  - pip: "So .replace() hands back a new string. I was dropping it on the floor every time."
hints:
  nudge: "What does `.replace()` hand back, and where does it go on line 5?"
  plan:
    - Find the line that does the replacing
    - Keep what .replace() hands back
    - Check the notice changes each time round the loop
  shape: |
    for word in rude_words:
        notice = notice.___(word, "*" * len(word))
---
Run Pip's censor and type `The blasted gulls took my flipping sandwich.` It should print:

```
The ******* gulls took my ******** sandwich.
```

Fix it.
