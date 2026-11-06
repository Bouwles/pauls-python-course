---
id: write-up
type: milestone
title: "Milestone: the write-up"
test_plan: true
evidence: none
dialogue:
  - aaesha.neutral.point: "Write down what it is, how it learnt, and where it goes wrong. Paul always does."
  - paul.thinking: "And what you'd check, if someone handed it to you cold."
checklist:
  - id: beats-bigram
    text: "Your model's perplexity on the held-back notes is lower than the bigram's, and both are in your write-up, with guessing evenly beside them."
    why: "A number on its own means nothing. Beside the bigram and a fair guess, it says how much was learnt."
  - id: held-back
    text: "The held-back notes were never used to train, or to choose a setting such as the rate or the number of steps."
    why: "The bottom drawer. Choose with them and they stop being a test."
  - id: write-up
    text: "The docstring at the top of reader.py is your write-up: what the model reads, what it guesses, how it was trained, and three notes it finished, with the seed and temperature."
    why: "The next person starts at the top of the file. It is the first thing anyone reads about a program they didn't write."
  - id: one-wrong
    text: "The write-up names one thing the reader gets wrong, with an example, and your best guess at why."
    why: "Every model is wrong somewhere. Knowing where is the useful part."
  - id: seeded
    text: "Every random choice comes from a seeded generator, so anyone running your program gets the notes you got."
    why: "If nobody can get your result again, nobody can check it. You included."
  - id: tried
    text: "You have tried every test in your plan, and written down what happened."
    why: "A plan that isn't run is a wish list."
  - id: tidy
    text: "Every function has a docstring, every name says what it holds, and no stray prints are left."
    why: "That works. Now make it so the next person can read it."
---
Paul's notes are why anyone can pick up the class's code. Leave yours the same way.

First, your test plan: at least three checks you'd make on a reader someone handed you, each with the result that would tell you it works. The same seed twice; a limit of 0; a start with a character the notes never use.

Then the write-up, as the docstring at the top of `reader.py`. What the model is, in a sentence. How it learnt: the notes, the windows, the steps. Its perplexity on the held-back notes beside the bigram's and guessing evenly. Three notes it finished. One thing it gets wrong: greedy notes that go round in circles are a fair start, or the words it invents.

Claim no more than it does. It learnt how Paul sounds, not what he means.
