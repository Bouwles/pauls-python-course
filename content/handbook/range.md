Python's `range()` produces a sequence of whole numbers, and it is most often used to make a `for` loop run a set number of times: `for i in range(10):` repeats ten times, with `i` going from 0 to 9. It takes up to three numbers, start, stop and step, and the rule to hold on to is that the stop number is never included. A range doesn't store its numbers in a list. It works each one out when the loop asks for it, so `range(1000000)` costs no more memory than `range(3)`.

## How it works

Wrapping a range in `list()` is a quick way to see what it contains:

```python
print(list(range(4)))
print(list(range(1, 5)))
print(list(range(0, 20, 5)))
print(list(range(5, 0, -1)))
print(list(range(5, 0)))
print(len(range(1, 101)))
```

```text
[0, 1, 2, 3]
[1, 2, 3, 4]
[0, 5, 10, 15]
[5, 4, 3, 2, 1]
[]
100
```

With one number, it is the stop and the start is 0. With two, they are start and stop. A step of 5 jumps in fives and still stops before 20. A negative step counts down, stopping before the stop number, so `range(5, 0, -1)` ends at 1. If the start is already past the stop in the direction of the step, as in `range(5, 0)`, the range is empty: no error, and a loop over it runs zero times. With a step of 1, `range(a, b)` holds `b - a` numbers, which is why `range(1, 101)` is exactly 100.

The numbers must be whole numbers. Counting positions in a list is a common use, and a decimal step is a common error:

```python
crates = ["rope", "nets", "tar"]
for i in range(len(crates)):
    print(i, crates[i])
print(range(0, 1, 0.5))
```

```text
0 rope
1 nets
2 tar
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    print(range(0, 1, 0.5))
          ~~~~~^^^^^^^^^^^
TypeError: 'float' object cannot be interpreted as an integer
```

`range(len(crates))` gives exactly the valid positions, 0 to 2, because it stops before the length. For steps of 0.5, loop over whole numbers and divide inside the body: `range(3)` with `n / 2` gives 0.0, 0.5 and 1.0.

## Common mistakes

- **Expecting the end number to be included.** `range(5)` gives 0 to 4, five numbers but no 5. To count from 1 to 10 inclusive, write `range(1, 11)`.
- **Expecting it to start at 1.** Without a start, it starts at 0. That matches list and string positions, which also start at 0, so `range(len(items))` lines up with them.
- **Thinking range only counts up.** A negative step counts down, as long as the start is bigger than the stop. To count from 5 down to 0, the stop has to be one further on: `range(5, -1, -1)`. `range(0, 5, -1)` is empty, because 0 is already below 5.

## Related

Ranges usually feed a [for loop](/handbook/for-loops), and each number lands in [the loop variable](/handbook/loop-variables). When you need both positions and items, [enumerate](/handbook/enumerate) is usually tidier than `range(len(...))`.
