---
id: make
type: make
title: Make the postcard records
files: [postcards.py]
entry: postcards.py
on_pass: { mira: "Four hundred and forty pence, and Truro stays Truro." }
hints:
  nudge: "Which of Mira's things is a fixed set of choices, and which is a record that must never change?"
  plan:
    - List the choices
    - Describe one record, frozen, with types
    - Add behaviour as methods
    - Functions take and give typed values
  shape: |
    class Stamp(Enum):
        FIRST = ___
        SECOND = ___
        ABROAD = ___


    @dataclass(___=True)
    class Postcard:
        sender: str
        to: str
        stamp: ___
        message: str = ___

        def postage(self) -> int:
            return self.stamp.___


    def total_postage(cards: list[Postcard]) -> int:
        total = 0
        for card in cards:
            total += ___
        return total


    def redirect(card: Postcard, town: str) -> Postcard:
        return replace(card, ___=town)
---
Write `postcards.py` from the brief. The comments are Moss's subgoals from Old Tom's lamp log.

```
Postcard(sender='Bea', to='Truro', stamp=<Stamp.FIRST: 135>, message='Wish you were here')
Postage today: 440 pence
Redirected to Penzance; the original still says Truro
```

Give `total_postage` and `redirect` type hints, for each argument and for what comes back: Moss reads them before he reads the code.

The checks try to change a posted card, add up an empty bag, and compare cards with each other.
