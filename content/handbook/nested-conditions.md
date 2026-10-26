A nested `if` is an `if` statement inside another `if`, indented one level further. The inner test is only asked when the outer test was `True`, so nesting is a way to say "check this first, and only then check that". Python works out which lines belong to which `if` entirely from the indentation, and the indentation also decides which `if` an `else` belongs to.

## How it works

These two pieces of code differ mainly in how far one `else` is indented, and that changes which `if` it belongs to:

```python
age = 10
hour = 12

if age >= 16:
    if hour >= 19:
        print("Adult, night fare")
    else:
        print("Adult, day fare")

if age >= 16:
    if hour >= 19:
        print("Adult, night fare")
else:
    print("Child fare")
```

```text
Child fare
```

In the first, the inner `if` and its `else` both sit inside the outer `if`. The age test is `False`, so Python skips the whole indented block: the hour is never checked and neither inner branch runs. Nothing is printed. In the second, the `else` lines up with `if age >= 16`, so it belongs to the age test and runs when that test fails.

Nesting can often be swapped for `and` and `elif`. This gives the same fares as a nested version would:

```python
age = 30
hour = 20
if age >= 16 and hour >= 19:
    print("4.00")
elif age >= 16:
    print("3.00")
else:
    print("1.50")
```

```text
4.00
```

The flat version has less indentation but repeats `age >= 16`.

## Common mistakes

- **Expecting the inner `if` to be checked anyway.** If the outer test is `False`, Python skips everything indented under it, inner tests included. If something should be checked whatever the outer test says, move it out to the outer level.
- **Pairing an `else` with the nearest `if`.** An `else` belongs to the `if` it lines up with, however many lines away that is. Line it up under the `if` you mean.
- **Lining up with nothing.** An `else` indented by an amount that matches no `if` above it, such as two spaces, gives `IndentationError: unindent does not match any outer indentation level`. Use four spaces for each level so every `else` lines up with exactly one `if`.

## When to use it

Nest when the inner test only makes sense once the outer one has passed, such as checking a list isn't empty before looking at its first item, or when the outer branch has several things to do. When an `else` contains nothing but another `if`, use [elif](/handbook/if-elif-else) instead, and when two tests always go together, join them with [and](/handbook/boolean-operators). More than two or three levels deep is usually a sign the code would read better flattened.
