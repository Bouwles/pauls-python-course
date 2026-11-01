---
id: make-postage
type: make
title: Caitlin's parcel run
dialogue:
  - caitlin.pleased.wave: "End of term, I'm posting everyone's stuff home. Each label says who and how heavy."
  - caitlin.thinking.point: "I want who owes what. Before anyone goes home."
on_pass: { caitlin.laughing.thumbs: "Me, two parcels, four seventy. And Neil's box goes by courier. I'm not asking what's in it." }
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
