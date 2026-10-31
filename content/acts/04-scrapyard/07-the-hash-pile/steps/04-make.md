---
id: make
type: make
title: Make the hash map
files: [hash_map.py]
entry: hash_map.py
on_pass: { yahya: "Two hundred parts, five hundred and twelve piles, and none of them more than three deep." }
hints:
  nudge: "Every method starts the same way: which pile would this name be in? What do `put`, `get`, `remove` and `in` each do once they're looking along that pile?"
  plan:
    - "__init__: a list of empty piles, a count of names, and probes at 0"
    - "A helper that gives the pile for a name"
    - "A helper that walks a pile looking for a name, adding a probe per comparison, and gives back the position or -1"
    - "put: found? Replace the pair there. Not found? Append, count it, and double the piles if there are now too many"
    - "doubling: new empty piles, twice as many, then every old pair appended to its new pile, in order"
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
`part_hash` is in `hash_map.py`, and a list of the store room's parts. Write `HashMap` beside them: the brief has every method, and the reading has how they work.

Keep `probes` honest: add one each time a stored name is compared with the one being looked for, in `put`, `get`, `remove` and `in` alike. Python calls `__contains__(self, name)` for `name in parts`, as it calls `__len__` for `len`.

Then the main block: store the two hundred parts, count the probes to find each once, and count them again along one long list, stopping at each match.

The hidden checks count probes in piles where names collide, replace and remove names that share a pile, check the piles double at exactly the right moment, store `None` as a value, and file a thousand parts.
