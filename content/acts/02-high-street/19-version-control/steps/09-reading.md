---
id: github-reading
type: reading
title: A copy somewhere else
dialogue:
  - paul.neutral: "If your history only lives on one computer it goes when the computer does, which is why you keep a copy elsewhere."
---
**GitHub** keeps a copy of a git repository on the internet. Your computer's copy and GitHub's are both whole: every commit, every message. `git push` sends your new commits up, and `git pull` brings other people's down. It's also where people will look at your work.

Setting it up is three commands, once you've made an empty repository on github.com with the **New** button:

```console
$ git remote add origin https://github.com/you/job-tracker.git
$ git branch -M main
$ git push -u origin main
```

`origin` is the usual name for the copy you push to. `-u` tells git to remember it, so next time `git push` is enough.

Keep things out that don't belong: a file called `.gitignore`, with a line for each, such as `__pycache__/` and `.venv/`.
