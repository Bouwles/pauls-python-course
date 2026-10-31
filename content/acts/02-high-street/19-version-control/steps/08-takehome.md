---
id: github
type: takehome
title: Your first repository, on GitHub
python: "3.10"
setup: |
  You'll need **git** and a free **GitHub** account. On Windows, install Git for Windows from git-scm.com. On a Mac, typing `git --version` in Terminal offers to install it. On Linux, use your package manager, such as `sudo apt install git`. Then tell git who you are, once: `git config --global user.name "Your Name"` and `git config --global user.email you@example.com`.

  GitHub asks for a password-like token, not your password, the first time you push. Its sign-in page walks you through it.
dialogue:
  - paul: "Everything you just did, on your own computer, for real. Then a copy of it on GitHub."
---
The project is the job tracker, with a `README.md` that's waiting for your words, and nine tests. Three check the project. Six check your repository: that it exists, has a history and a `.gitignore`, has everything committed, and has been pushed to GitHub.

1. Write the README: what it is, who it's for, and how to run it.
2. `git init`, add a `.gitignore`, and commit, more than once, with honest messages.
3. Make an empty repository on GitHub and push to it.
4. Run `pytest`. When all nine pass, hand it in.

If a test fails, its message says what to do next.
