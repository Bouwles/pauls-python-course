---
id: make
type: make
title: Make the hash map
files: [hash_map.py]
entry: hash_map.py
on_pass: { neil.pleased.cheer: "Two hundred parts, five hundred and twelve piles, and none of them more than three deep." }
hints:
  nudge: "Every method starts the same way: which pile would this name be in? What do `put`, `get`, `remove` and `in` each do once they're looking along that pile?"
  plan:
    - "Start with empty piles, a count, and no probes"
    - "Which pile: the hash, remainder by the number of piles"
    - "Look along that pile, a probe per comparison, giving back the position or -1"
    - "put: already there? Replace its pair. A new one goes on the end of its pile, is counted, and too full means double"
    - "Doubling: twice the piles, and everything moved to its new pile, old piles in order"
    - "get, remove and in: find the position, then hand back, take out, or say yes or no"
  shape: |
    def _find(self, pile, name):
        for position, (stored, _value) in enumerate(pile):
            self.probes = ___
            if stored == name:
                return ___
        return -1


    def put(self, name, value):
        pile = self.piles[part_hash(name) % ___]
        position = self._find(pile, name)
        if position >= 0:
            pile[position] = ___
            return
        pile.append((name, value))
        self.count = self.count + 1
        if self.count > ___ * len(self.piles):
            self._double()
---
`part_hash` is in `hash_map.py`. Write `HashMap` beside it: the brief has every method, and Paul's labels are in the file as comments. Your piles hold `(name, value)` pairs, where his held names.

Keep `probes` honest: add one each time a stored name is compared with the one being looked for, in `put`, `get`, `remove` and `in` alike. Python calls `__contains__` for `in` and `__len__` for `len`.

Then the main block: store the two hundred parts, count the probes to find each once, then count them along one long list, stopping at each match.

```
200 parts in 512 piles, 0.39 to a pile
Finding every part: 260 probes
Finding every part along one long list: 20100 probes
```

The hidden checks collide names, replace and remove names that share a pile, check the piles double at exactly the right moment, and store `None` as a value.
