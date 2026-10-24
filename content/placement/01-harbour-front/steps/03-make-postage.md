---
id: make-postage
type: make
title: Mira's postage book
dialogue:
  - mira: "The morning sack. Each label says who and how heavy. I want who owes what."
on_pass: { mira: "Bea, two parcels, four seventy. In order, and the anvil left for the ferry." }
---
`parcels` in `main.py` is the morning sack, one label per parcel: `"Name: kg"`. Spaces round the name and the weight don't matter.

1. `postage(kg)` gives back the price of one parcel: up to 1 kg, 1.20; up to 5 kg, 3.50; up to 20 kg, 6.00. Over 20 kg it gives back `None`: that goes as ferry freight.
2. `tally(parcels)` gives back a dictionary of each name and the list of their parcels' prices, in the order they came. Freight is left out.
3. Run as a program, it prints a line for each name, in alphabetical order, then the total. With nothing to charge, it prints `Nothing to post.`

```
Bea Hollis: 2 parcels, £4.70
Gwen: 1 parcel, £6.00
Old Tom: 1 parcel, £1.20
Total: £11.90
```

The checks call both functions, and run the program with other sacks in `parcels`.
