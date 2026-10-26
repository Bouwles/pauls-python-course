The Python `in` operator asks whether a value is in a collection, and how long that takes depends on the collection. On a list, `in` compares the value with each item in turn, from the front, so a longer list takes longer. On a set, or among the keys of a dictionary, `in` works out where the value would be stored and looks only there, so the size barely matters. If a program asks `in` many times of the same large collection, make a set first.

## How it works

On a list, `ticket in tickets` compares with index 0, then index 1, and so on until it finds a match. This function does the same scan by hand and counts the comparisons:

```python
def comparisons_needed(items, target):
    count = 0
    for item in items:
        count += 1
        if item == target:
            break
    return count


tickets = list(range(100_000))
print(comparisons_needed(tickets, 3))
print(comparisons_needed(tickets, 99_999))
print(comparisons_needed(tickets, -1))
```

```text
4
100000
100000
```

A ticket near the front is found quickly. One at the end, or one that isn't there, means looking at all 100,000. Double the list and the worst case doubles.

A set works differently. When a value goes in, Python calculates its hash, a number worked out from the value itself, and uses it to decide where to store the value. To answer `in`, Python calculates the hash of the value you asked about and checks that one place (occasionally a few others), never the rest. Dictionary keys are stored the same way, so `name in prices` is equally fast. `value in prices.values()` is not: values aren't hashed, so that is a scan like a list.

On an ordinary laptop, checking for a missing number among 100,000 took about 0.7 milliseconds in a list and about 12 nanoseconds in a set. A single check of either is too quick to notice; the difference shows inside a loop: checking 10,000 names against a list of 10,000 can mean 100 million comparisons, against a set about 10,000 lookups.

Building the set costs one pass over the list, so it pays off only when you check more than a few times.

## Common mistakes

- **Thinking `in` takes the same time on any list.** It depends on the list's length and where the item sits. The slowest case is a value that isn't there, because Python must check every item before it can answer `False`.
- **Swapping every list for a set.** A set throws away order and repeats, and can't be indexed. Parcels in delivery order, or daily takings where two days can match, must stay in a list. When you need both, keep the list and build a set beside it for the checking.

## Related

[Sets](/handbook/sets) and [dictionaries](/handbook/dictionaries) both rely on [hashing](/handbook/hashing). In [Big O](/handbook/big-o) terms, `in` is O(n) on a list and O(1) on average on a set. [Timing code](/handbook/timing-code) shows how to measure it yourself.
