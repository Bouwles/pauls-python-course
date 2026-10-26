Python's `random` module makes random numbers and random choices, for dice, games, shuffled quizzes and simulations. After `import random`, `random.randint(1, 6)` gives a whole number from 1 to 6 with both ends included, `random.choice()` picks one item from a list, and `random.shuffle()` mixes a list into a new order. The numbers come from a formula that starts from a value called the seed. `random.seed()` lets you set that starting point, so a program gives the same "random" results on every run, which makes it much easier to test.

## How it works

```python
import random

random.seed(7)
roll = random.randint(1, 6)
print(roll, roll)
print(random.randint(1, 6), random.randint(1, 6))
random.seed(7)
print(random.randint(1, 6))
```

```text
3 3
2 4
3
```

`roll` holds the one number `randint` picked, so printing it twice prints the same number. A new number only appears when `randint` is called again, as on the second `print`. Calling `random.seed(7)` again winds the sequence back to the start, so the next roll is 3 again. Without a seed, Python picks a starting point that changes every run. With one, the same seed gives the same numbers on the same version of Python, so you should see exactly the output shown here.

Choosing and shuffling work on lists:

```python
import random

random.seed(5)
stops = ["Quay", "Market", "Pier", "Chapel"]
print(random.choice(stops))
result = random.shuffle(stops)
print(result)
print(stops)
```

```text
Pier
None
['Market', 'Quay', 'Chapel', 'Pier']
```

`choice` returns one item and leaves the list alone. `shuffle` rearranges the list itself and returns `None`, which is why `result` is `None`. If you need a shuffled copy and want to keep the original order, use `random.sample(stops, len(stops))`, which returns a new list.

## Common mistakes

- **Expecting `randint` to leave out the top number.** `randint(1, 6)` can give 6. It includes both ends, unlike `range(1, 6)`, which stops at 5. If you do want the end left out, `random.randrange(1, 6)` follows the `range` rule.
- **Expecting a variable to re-roll.** A variable keeps the number it was given until you assign a new one. To get a fresh number each time round a loop, call `randint` inside the loop, not before it.
- **Saving the result of `shuffle`.** `stops = random.shuffle(stops)` replaces your list with `None`. Call `random.shuffle(stops)` on a line of its own.
- **Seeding inside a loop.** Calling `random.seed(7)` before every roll restarts the sequence each time, so every roll comes out the same. Seed once, at the start of the program.

## Related

The module has to be loaded first with [import](/handbook/imports). For why `randint` and [range()](/handbook/range) treat their end differently, compare the two pages, and for seeds in larger programs see [reproducibility](/handbook/reproducibility).
