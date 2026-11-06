---
id: make
type: make
title: Make the round of crates
files: [chalk_round.py]
entry: chalk_round.py
on_pass: { neil.proud.thumbs: "Tank in, axle out, round the other way. And not one crate lifted." }
hints:
  nudge: "To change the round just after a crate, which crate's `next` has to change, and what must you hold on to before you change it?"
  plan:
    - "Crate: a part, and a next that starts as None"
    - "append, parts and __len__: Paul's treasure hunt"
    - "insert_after: walk to the crate holding existing; the new crate points at that crate's next; then that crate points at the new one"
    - "remove: if the first crate holds it, head moves on; otherwise stop on the crate before it and point that crate past it"
    - "reverse: before starts as None; for each crate, hold on to its next, point it back at before, then step both along"
    - "Nothing found: raise ValueError"
  shape: |
    def insert_after(self, existing, part):
        crate = self.head
        while crate is not None and crate.part != existing:
            crate = ___
        if crate is None:
            raise ValueError(f"no {existing} on the round")
        new = Crate(part)
        new.next = ___
        crate.next = ___


    def reverse(self):
        before = None
        crate = self.head
        while crate is not None:
            after = ___
            crate.next = ___
            before = ___
            crate = ___
        self.head = ___
---
Write `Crate` and `Round` in `chalk_round.py`, so the main block at the bottom prints this:

```
Round: ['axle', 'brakes', 'chassis', 'drive-chain']
After the brakes, a fuel tank: ['axle', 'brakes', 'fuel-tank', 'chassis', 'drive-chain']
Neil took the axle: ['brakes', 'fuel-tank', 'chassis', 'drive-chain']
From the far end: ['drive-chain', 'chassis', 'fuel-tank', 'brakes']
4 crates
```

`append` and `parts` follow Paul's treasure hunt. `__len__` walks and counts. `insert_after` and `remove` are "Changing two arrows": find the crate before the change, then set the arrows in the right order. Taking off the first crate means changing `head`. `reverse` is "Turning the round round", with `self.head` set at the end.

The hidden checks try empty rounds, one-crate rounds, the first and last crates and repeated parts, and check that your crates really point at each other.
