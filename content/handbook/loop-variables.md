In a Python `for` loop, the loop variable is the name between `for` and `in`: `name` in `for name in names:`, or `i` in `for i in range(5):`. At the start of every pass, Python takes the next value and assigns it to that name, exactly as if you had written `name = ...` at the top of the body. It is an ordinary variable. You can print it, do sums with it or use it as a list position, and it is still there after the loop ends. Choosing a clear name for it matters more than it seems: `for parcel in parcels:` tells the reader what each pass is about, and `for x in y:` doesn't.

## How it works

Assigning to the loop variable inside the body works, but only until the next pass, when Python overwrites it with the next value:

```python
for night in range(1, 4):
    print("Start of pass:", night)
    night = night * 10
    print("Changed to:", night)
print("After the loop:", night)
```

```text
Start of pass: 1
Changed to: 10
Start of pass: 2
Changed to: 20
Start of pass: 3
Changed to: 30
After the loop: 30
```

The `range` hands out 1, 2 and 3 regardless of what the body does with `night`, so there are still three passes. After the loop, `night` keeps the last value it held, which here is the changed 30 rather than 3.

There is one case where the loop variable doesn't exist afterwards: when the loop ran zero times.

```python
for crate in []:
    print("Unpacking", crate)
print("Last crate:", crate)
```

```text
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print("Last crate:", crate)
                         ^^^^^
NameError: name 'crate' is not defined
```

The list is empty, so the body never ran and no value was ever assigned to `crate`. If code after a loop relies on the loop variable, make sure the loop runs at least once, or give the name a value before the loop.

## Common mistakes

- **Thinking the loop variable disappears when the loop ends.** In Python a loop doesn't have its own private variables. The name stays, holding the last value it had, and code after the loop can use it. Some other languages do throw it away, which is where this belief often comes from.
- **Changing the loop variable to skip or repeat passes.** The number of passes is fixed by what comes after `in`, not by the variable. To stop early, use `break`; to skip the rest of one pass, use `continue`. When the number of passes depends on what happens inside, a `while` loop is the right tool.
- **Reusing a name you still need.** `for name in names:` overwrites any `name` you set before the loop. Pick a loop variable that isn't already in use, and use `_` when you don't need the value at all: `for _ in range(3):`.

## Related

The loop itself is covered in [for loops](/handbook/for-loops) and the numbers it often counts through in [range](/handbook/range). For stopping or skipping passes, see [break and continue](/handbook/break-continue) and [while loops](/handbook/while-loops).
