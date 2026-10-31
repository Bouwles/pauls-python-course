`enumerate()` is the Python built-in for looping over a list while knowing each item's position. `for number, name in enumerate(clients):` hands over a pair each time round the loop, the count first and the item second, so you never need a separate counter that you add 1 to by hand. It's the usual answer to "Python for loop with index", and it reads better than `for i in range(len(clients)):` followed by `clients[i]`.

## How it works

Each pair is a tuple, and the `for` loop unpacks it into two names. Turning the pairs into a list shows exactly what `enumerate()` produces:

```python
stops = ["Station", "Mill", "Church"]
print(list(enumerate(stops)))

for position, stop in enumerate(stops):
    print(position, stop)

for number, stop in enumerate(stops, start=1):
    print(f"{number}. {stop}")
```

```text
[(0, 'Station'), (1, 'Mill'), (2, 'Church')]
0 Station
1 Mill
2 Church
1. Station
2. Mill
3. Church
```

By default the count starts at 0, which matches list indexes: position 2 is `stops[2]`. That is what you want when the number will be used to look something up in the list or change it. `start=1` changes only the numbers handed out, not which items you get. It is for lists that a person will read.

Because the default count is the index, `enumerate()` is the tidy way to change a list in place while looping over it:

```python
prices = [3.5, 12.0, 7.25]
for index, price in enumerate(prices):
    if price > 10:
        prices[index] = 10.0
print(prices)
```

```text
[3.5, 10.0, 7.25]
```

Assigning a new value to `price` inside the loop would only change the loop variable, and the list would stay as it was. Writing to `prices[index]` changes the list itself.

`enumerate()` works on anything you can loop over, not only lists: the characters of a string, the lines of a file, the pairs from `zip()`.

## Common mistakes

- **Expecting the count to start at 1.** It starts at 0 unless you pass `start=1`. Numbered lists for people usually want `start=1`; numbers you'll use as indexes want the default.
- **Getting the pair the wrong way round.** The count always comes first and the item second. Your variable names don't change that: `for name, number in enumerate(clients):` puts the count in `name` and the client in `number`, which runs without an error but leaves each name holding the wrong thing. Write the count's name first.
- **Indexing with a count that started at 1.** With `start=1`, each number is one more than the item's index, so `clients[number]` gets the next client along, and on the last one raises an IndexError. Use the default start when the number is an index.

## Related

Each pair is taken apart by [unpacking](/handbook/unpacking), inside an ordinary [for loop](/handbook/for-loops). To walk two lists side by side, rather than one list and its positions, use [zip()](/handbook/zip).
