---
id: pips
type: pips
title: Fix Aaesha's version
argv_field: true
dialogue:
  - aaesha.pleased: "I made Paul's hours tool. You type a name after it, and it adds up their repairs."
  - aaesha.confused: "It says no jobs for main.py. Nobody here is called main.py. Can you look?"
dialogue_after:
  - aaesha.laughing: "So argv starts with the program's own name. Noted. Twice."
hints:
  nudge: "What's in `sys.argv[0]`? And what does finishing with 0 tell Paul's backup script?"
  plan:
    - Run it with Yahya and see which name it searched for
    - Read the customer from the first word after the program's name
    - Exit with 1 when there are no jobs
  shape: |
    customer = sys.argv[___]
    ...
    if total == 0:
        print(f"No jobs for {customer}.")
        sys.exit(___)
---
Aaesha's tool adds up someone's repair hours from `jobs.csv`, the Workshop's repair list. Type `Yahya` in the Arguments box and run it. It should print `Yahya: 7.0 hours`.

Then try `Aaesha`, who has no jobs. The backup script only copies the ledger if the tools before it finish with 0, so a tool that fails must say so with 1.
