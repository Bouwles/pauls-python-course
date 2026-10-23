---
id: make
type: make
title: Make the pigeonhole finder
on_pass: { mira: "Hole one for Old Tom. Not two. One." }
hints:
  nudge: "There are two jobs: fill the list, then search it. Which loop adds the parcels, and which one finds the hole?"
  plan:
    - Keep the items in a list, starting empty and adding each parcel until done
    - Show every item with its index
    - Ask who's at the counter
    - Check it's there at all
    - Find its index
    - Take it out
    - Say so if it isn't
    - Count what's left
  shape: |
    parcels = ___
    name = input("Parcel for? ")
    while name != "done":
        parcels.___(name)
        name = input("Parcel for? ")
    for hole in range(___):
        print(f"Hole {hole}: {parcels[hole]}")
    person = input("At the counter? ")
    if person ___ parcels:
        for hole in range(len(parcels)):
            if parcels[hole] == person:
                found = hole
        parcels.___(found)
        print(f"Hole {found}.")
    else:
        print(f"Nothing for {person} today.")
    print(f"Parcels left: {___}")
---
Write Mira's pigeonhole finder. `[]` is an empty list, ready to fill.

```
Parcel for? Bea Hollis
Parcel for? Old Tom
Parcel for? Agnes Rook
Parcel for? done
Hole 0: Bea Hollis
Hole 1: Old Tom
Hole 2: Agnes Rook
At the counter? Old Tom
Hole 1.
Parcels left: 2
```

If there's nothing for them: `Nothing for Dennis today.` Moss's labels from the tool wall are in the file.
