---
id: make
type: make
title: Make the noticeboard
on_pass: { agnes: "Six requirements, six met. I'll pin the first one up myself." }
hints:
  nudge: "Each requirement is one or two string methods. Which method does each need, and are you keeping what it hands back?"
  plan:
    - Ask for the text
    - Tidy the spaces
    - Change the case
    - Cut it to fit
    - Replace what has to go
    - Frame it and centre it
  shape: |
    title = input("Title? ")
    notice = input("Notice? ")
    title = title.___()
    notice = " ".join(notice.___())
    title = title.___()
    if len(title) > width:
        title = title[:___] + "..."
    for word in rude_words:
        notice = notice.___(word, "*" * ___)
    print("=" * width)
    print(title.___(width))
    print(notice)
    print("=" * width)
---
Build the noticeboard to Agnes's six requirements.

```
Title?   lost: one lobster pot
Notice? Blue,   with a blasted yellow rope.  Return to the harbour office.
========================================
         LOST: ONE LOBSTER POT
Blue, with a ******* yellow rope. Return to the harbour office.
========================================
```

The comments are Moss's subgoals from Tom's notice. Mind requirement 3: exactly 40 characters still fits.
