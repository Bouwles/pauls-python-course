---
id: learn-modules
type: learn
title: A module of your own
concept: modules
---
Any `.py` file you write is a **module** too. Its name is the file name without `.py`, and any other program in the same folder can import it.

Every floor has its own copy of the opening-hours code, and one copy went wrong. Write the code once in `hours.py`, and every floor imports that one copy.

```python
# sizes.py
def to_inches(cm):
    return cm / 2.54
```

```python
# main.py
import sizes

print(sizes.to_inches(254))
```

Running `main.py` prints `100.0`. `import sizes` runs `sizes.py` once and gives you its names with `sizes.` in front, as `import math` does.

The usual slip is to give a variable the module's name, as in `sizes = 3`. From then on, `sizes` is the number, and the module can't be reached.
