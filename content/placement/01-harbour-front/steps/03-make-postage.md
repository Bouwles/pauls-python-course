---
id: make-postage
type: make
title: Aaesha's parcel run
dialogue:
  - aaesha: "End of term, I'm posting everyone's parcels. Each label says who and how heavy. I want who owes what."
on_pass: { aaesha: "Caitlin, two parcels, four seventy. In order, and Neil's box left for the courier." }
---
`parcels` in `main.py` is the pile by the door, one label per parcel: `"Name: kg"`. Spaces round the name and the weight don't matter.

1. `postage(kg)` gives back the price of one parcel: up to 1 kg, 1.20; up to 5 kg, 3.50; up to 20 kg, 6.00. Over 20 kg it gives back `None`: that one goes by courier.
2. `tally(parcels)` gives back a dictionary of each name and the list of their parcels' prices, in the order they came. Courier parcels are left out.
3. Run as a program, it prints a line for each name, in alphabetical order, then the total. With nothing to charge, it prints `Nothing to post.`

```
Aaesha: 1 parcel, £6.00
Caitlin: 2 parcels, £4.70
Yahya: 1 parcel, £1.20
Total: £11.90
```

The checks call both functions, and run the program with other piles in `parcels`.
