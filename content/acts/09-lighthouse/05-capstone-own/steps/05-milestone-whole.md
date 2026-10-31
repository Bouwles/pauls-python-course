---
id: whole-project
type: milestone
title: "Milestone 3: the whole project"
evidence: link
dialogue:
  - paul: "Everything the proposal promised. If something changed, say what and why."
  - caitlin: "Mine changed a lot."
  - paul: "Then the README will be interesting."
checklist:
  - id: promised
    text: "Everything the proposal promised works, or the README says what changed and why."
    why: "Plans change. Changing them quietly is the problem."
  - id: readme
    text: "The README says what it's for, who it's for, how to install it, how to use it, and how to run the tests."
    why: "The README is the front door. Most people never get further."
  - id: tested-core
    text: "Every rule and calculation has tests, including the edges and the inputs it should refuse."
    why: "The edges are where it'll break in someone else's hands."
  - id: bad-input
    text: "Wrong or strange input gets a clear message, never a traceback."
    why: "A traceback is a message for you. The person it's for deserves one of their own."
  - id: readable
    text: "Names say what things hold, each function does one job, and nothing clever is left unexplained."
    why: "That works. Now make it so the next person can read it."
  - id: no-secrets
    text: "No passwords, keys or anyone's private details are in the repository."
    why: "Git remembers everything, for ever. Including the file you deleted."
---
Thicken the slice, one piece at a time: each piece tested, committed, and shown to the person it's for when it changes something they'll notice.

When the proposal turns out wrong, and part of it will, change the plan on purpose. Write down what changed and why, and keep it for the README.

Then the README itself: what it is, who it's for, how to install it, how to use it, how to run the tests. Write it for the person it's for, not for Paul.

Last, go through the code as a stranger would. Rename anything whose name you had to explain to yourself.
