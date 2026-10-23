---
id: pips
type: pips
title: Pip's Version
argv_field: true
dialogue:
  - pip: "I made Moss's tool already. You type a name after it. Very professional."
  - pip: "It says no jobs for main.py. We haven't got a customer called main.py."
dialogue_after:
  - pip: "So argv starts with its own name. Bit vain, for a list."
hints:
  nudge: "What's in `sys.argv[0]`? And what does finishing with 0 tell Moss's backup script?"
  plan:
    - Run it with Ferro and see which name it searched for
    - Read the customer from the first word after the program's name
    - Exit with 1 when there are no jobs
  shape: |
    customer = sys.argv[___]
    ...
    if total == 0:
        print(f"No jobs for {customer}.")
        sys.exit(___)
---
Pip's tool adds up a customer's hours from `jobs.csv`. Type `Ferro` in the Arguments box and run it. It should print `Ferro: 7.0 hours`.

Then try `Gwen`, who has no jobs. The backup script only copies the ledger if the tools before it finish with 0, so a tool that fails must say so with 1.
