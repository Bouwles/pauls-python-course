---
id: handed-over
type: milestone
title: "Milestone 4: tested, documented, handed over"
evidence: link
dialogue:
  - agnes: "I don't read code. I read instructions. Then I follow them exactly, which most people don't."
  - moss: "Then the instructions had better be right."
checklist:
  - id: agreed
    text: "Every agreed test passes, and the report is handed in on the Take It Home step."
    why: "The agreed tests are the contract. Agnes signed it before you wrote a line."
  - id: mine
    text: "Your own tests pass too, and there are at least eight of them."
    why: "Eight is not a magic number. It is enough that you had to think of the awkward cases."
  - id: readme
    text: "README.md is rewritten for Agnes: install, start, use, test, in that order."
    why: "The README is the only part of the code Agnes will ever read. Write it as if it were the only part."
  - id: routes
    text: "Every route is written down: method, path, what to send, what comes back, and the errors."
    why: "The next person to work on it will start with this list, and the next person might be you, in a year."
  - id: debug-off
    text: "Debug mode is off unless someone asks for it, and nothing secret is in the code."
    why: "Debug mode lets anyone who can reach the page run code on Agnes's computer. Off, unless you're the one debugging."
  - id: tidy
    text: "No stray print calls, no commented-out experiments, and every function's name says what it does."
    why: "That works. Now make it so the next person can read it."
  - id: stranger
    text: "Someone else has installed and run it on another computer, from the README alone."
    why: "Anything you had to explain out loud belongs in the README. Watch where they hesitate, then write that down."
---
Agnes's copy of the project comes from your repository, so the repository is the handover: the code, the tests, `requirements.txt`, and a README written for her.

The course's README tells you how to set up and hand in. Replace it with Agnes's: what the app is for, how to install it, the one command that starts it, how to book, how to cancel, how to run the tests, and the routes with their errors.

Hand the pytest report in on the Take It Home step. Then the hardest test of all: give the repository to someone who has never seen it, and say nothing while they follow the README.
