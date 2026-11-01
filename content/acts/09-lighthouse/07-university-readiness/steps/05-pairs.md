---
id: pairs
type: make
title: "Question 4: Two for a pound"
files: [pairs.py]
entry: pairs.py
on_pass: { caitlin.surprised: "Mine took a minute on the whole list. Yours took a blink. Fine. Yours is better." }
hints:
  nudge: "A 30p item needs a 70p partner. How could you know how many 70p items you've already gone past, without looking back through the list?"
  plan:
    - "A dictionary: each price, and how many items at that price you've gone past"
    - For each price, the partner it needs is the target minus the price
    - Add how many of those partners you've already gone past
    - Only then count this price as gone past, so an item never pairs with itself
    - Hand back the total
  shape: |
    def count_pairs(prices, target):
        seen = {}
        pairs = 0
        for price in prices:
            pairs += seen.get(___, 0)
            seen[price] = ___
        return pairs
---
Caitlin's favourite food market has a new offer: any two items that come to exactly a pound. How many pairs qualify? Caitlin wrote `count_pairs` the plain way. It's right, and far too slow for the whole market's price list.

`count_pairs(prices, target)` returns how many pairs of different items, at positions `i < j`, have prices adding up to exactly `target` pence.

1. In a comment, write the Big-O of the starter's version, and why.
2. Rewrite it to be O(n): one pass through the prices.

**Limits:** up to 200,000 prices, each a whole number of pence from 0.

```
count_pairs([30, 70, 50, 50, 20], 100)    gives 2    30 + 70, and 50 + 50
count_pairs([50, 50, 50], 100)            gives 3    three ways to pick two of them
```

The checks give it 200,000 prices and five seconds.
