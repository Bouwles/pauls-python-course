---
id: make-ferry
type: make
title: Riya's exhibition tickets
dialogue:
  - riya.pleased.wave: "Open day. My prints are up in the Makerspace, twelve visitors at a time."
  - riya.laughing: "People keep asking about the clock. It still says 3:14."
on_pass: { riya.proud.cheer: "Twelve up the stairs and not a thirteenth. The stairs are very old." }
---
Write Riya's ticket desk for her exhibition in `main.py`.

1. Ask `Age? ` for each visitor, until a blank line.
2. An age that isn't a whole number of years, like `ten`, `4.5` or `-3`, gets `Ages are whole numbers.` and no ticket. Spaces round an age don't matter.
3. Under 5 go free. 5 to 15 pay £1.50, 16 to 64 pay £3.20, and 65 and over pay £2.00. Print `Ticket: £3.20`, or `Ticket: free`.
4. The room takes 12. When the twelfth visitor has a ticket, print `Full.` and stop asking.
5. At the end, print how many are going up and what they paid.

```
Age? 34
Ticket: £3.20
Age? 3
Ticket: free
Age? ten
Ages are whole numbers.
Age? 70
Ticket: £2.00
Age?
Visitors: 3
Total: £5.20
```
