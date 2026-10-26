In Python, `import` loads a module: a file of ready-made code, such as `math` for square roots and rounding, `random` for random numbers or `datetime` for dates. Python starts with only a small set of built-in functions like `print()` and `len()`. Everything else lives in modules, so a program loads only what it uses. Put `import math` at the top of the file, and from then on reach the module's tools through its name and a dot: `math.sqrt(49)`.

## How it works

Without the import, the module's name means nothing to Python:

```python
print("Rolling")
print(random.randint(1, 6))
```

```text
Rolling
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    print(random.randint(1, 6))
          ^^^^^^
NameError: name 'random' is not defined. Did you forget to import 'random'?
```

`Rolling` is printed first. A missing import is a [NameError](/handbook/name-error), found when the line runs, not a [SyntaxError](/handbook/syntax-error) found before anything starts. Python 3.14 recognises the names of the standard modules and suggests the fix.

`import random` brings in the module as a single name, `random`, with its tools inside it. If you would rather use a tool's name on its own, `from ... import` copies chosen names into your file:

```python
import math
from random import randint, seed

seed(1)
print(math.floor(7.8), math.pi)
print(randint(1, 6))
```

```text
7 3.141592653589793
2
```

Both styles are common. `math.floor` makes it obvious where the function came from; `randint` on its own is shorter. You can also rename a module as you import it, as in `import datetime as dt`, which is mostly done for long names. Either way, imports go at the top of the file, so a reader can see at a glance what the program depends on.

## Common mistakes

- **Using a module without importing it.** Only the built-in functions are there from the start. `math`, `random` and the rest need an `import` line first, or you get a NameError like the one above.
- **Writing a tool's name on its own after `import random`.** `randint(1, 6)` gives `NameError: name 'randint' is not defined`. Write `random.randint(1, 6)`, or import the name with `from random import randint`.
- **Expecting a missing import to stop the program before it starts.** It isn't a SyntaxError. The lines before it run, and if the line that uses the module is in a branch that doesn't run, there is no error at all until it does.
- **Naming your own file after a module.** A file called `random.py` next to your program gets imported instead of the real module, and `random.randint` then fails with an AttributeError. Python 3.14's message suggests renaming the file. Call it `dice.py` or similar.

## Related

[Random numbers](/handbook/random-module) covers the `random` module itself. [Modules](/handbook/modules) explains how to split your own code into files you can import, and [the standard library](/handbook/standard-library) is the set of modules that come with Python.
