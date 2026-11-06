---
id: learn-conflicts
type: learn
title: When two changes collide
concept: merge-conflicts
dialogue:
  - paul.thinking.think: "Two people, one line. Git won't guess who's right. That's your job."
---
A **conflict** happens when both branches have changed the same lines since they split. Git can't know which is right, so it writes both into the file and stops for you to choose:

```text
<<<<<<< HEAD
URGENT_EXTRA = 6
=======
URGENT_EXTRA = 8
>>>>>>> prices
```

The lines above `=======` are the branch you're on. The lines below are the branch you're merging in.

To settle it, edit the file to say what it should, delete the three marker lines, then `git add` the file and `git commit`. If it gets tangled, `git merge --abort` puts everything back as it was before the merge.

The usual slip is to think a conflict means something is broken. It's git asking a question. Check no marker line is left behind before you commit.
