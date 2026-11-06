---
id: make
type: make
title: Make the Clocktower sign
on_pass: { paul.pleased: "Four lines, straight, and the apostrophe where it belongs." }
hints:
  nudge: "Each line of the sign needs its own `print()`. Which kind of quotes lets PAUL'S keep its apostrophe?"
  plan:
    - Say what the program is for
    - Print each line of the sign, top to bottom
    - Use the other kind of quotes when the text contains quotes
  shape: |
    # Say what the program is for
    # ___

    # Print each line of the sign, top to bottom
    print("___")
    print("___")
    print("___")
    print("___")
---
Now the real one: the sign for the Clocktower's front door. Your program prints these four lines, exactly:

```text
PAUL'S PYTHON COURSE
Python, from the ground floor up
Open Monday to Friday, 9 till 5
Ignore the clock. It says 3:14.
```

Your file starts with Paul's three steps as comments. Under the first, write a comment of your own saying what the program is for. Then write one `print()` for each line of the sign, in order. `PAUL'S` has an apostrophe, so choose its quotes with care.

The checks look for the first line, then the whole sign in order, then your comment. Capitals, commas, full stops and the apostrophe all count.
