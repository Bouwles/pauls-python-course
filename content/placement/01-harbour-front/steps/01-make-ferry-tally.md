---
id: make-ferry
type: make
title: Ferro's boarding tally
dialogue:
  - ferro: "Count them aboard, take the fares. Twelve and she's full."
on_pass: { ferro: "Twelve aboard and not a thirteenth. Cast off." }
---
Write Captain Ferro's boarding tally in `main.py`.

1. Ask `Age? ` for each passenger, until a blank line.
2. An age that isn't a whole number of years, like `ten`, `4.5` or `-3`, gets `Ages are whole numbers.` and doesn't board. Spaces round an age don't matter.
3. Under 5 travel free. 5 to 15 pay £1.50, 16 to 64 pay £3.20, and 65 and over pay £2.00. Print `Fare: £3.20`, or `Fare: free`.
4. The ferry carries 12. When the twelfth passenger boards, print `Full.` and stop asking.
5. At the end, print how many boarded and what they paid.

```
Age? 34
Fare: £3.20
Age? 3
Fare: free
Age? ten
Ages are whole numbers.
Age? 70
Fare: £2.00
Age?
Passengers: 3
Fares: £5.20
```
