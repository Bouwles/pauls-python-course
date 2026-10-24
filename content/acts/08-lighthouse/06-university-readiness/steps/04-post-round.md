---
id: post-round
type: make
title: "Question 3: The post round"
files: [post_round.py]
entry: post_round.py
on_pass: { mira: "Up the odd side, down the even, and two parcels for one house in the order they came. As I'd walk it." }
hints:
  nudge: "What key could you give `sorted`, so that one tuple per parcel puts it in its place? What could stand for \"odd side first\"?"
  plan:
    - Write a key function that takes one parcel
    - "First in the key: the street"
    - Then something that puts the odd side before the even side
    - Then the number, going up on the odd side and down on the even side
    - Sort a copy with that key, and let stability keep each house's parcels in order
    - Hand back just the labels
  shape: |
    def delivery_key(parcel):
        label, street, number = parcel
        if number % 2 == 1:
            return (street, ___, number)
        return (street, ___, ___)


    def round_order(parcels):
        in_order = ___(parcels, key=delivery_key)
        return [label for label, street, number in ___]
---
Mira puts the morning's parcels in the order they'll be delivered. Each parcel is a tuple `(label, street, number)`.

Write `round_order(parcels)`, which returns the labels in delivery order:

1. Streets in alphabetical order.
2. On each street, up the odd side with the numbers going up, then back down the even side with the numbers going down.
3. Parcels for the same house stay in the order they came.

Leave `parcels` as it was.

**Limits:** up to 100,000 parcels. House numbers are whole numbers from 1. A street's name is written the same way every time.

```
round_order([("A", "Quay Row", 4), ("B", "Quay Row", 1), ("C", "Quay Row", 3), ("D", "Quay Row", 2)])
gives ["B", "C", "A", "D"]     1 and 3 going up, then 4 and 2 coming back

round_order([("E", "Quay Row", 2), ("F", "High Street", 5), ("G", "Quay Row", 2), ("H", "High Street", 2)])
gives ["F", "H", "E", "G"]     High Street first; E and G in the order they came
```
