A function in Python is a named block of code that you define once with `def` and then run whenever you like by calling its name with brackets. You use one whenever a piece of work deserves a name: printing a receipt, checking a password, working out a total. The program gets shorter because the lines aren't written out twice, and easier to fix because each piece can be tested on its own. Python's built-ins, such as `print()` and `len()`, are functions too; `def` lets you make your own.

## How it works

`def` only teaches Python the name. When a call happens, Python jumps to the first line of the function, runs its lines in order, then comes back to the line after the call. A function can call another function, and the same jump-and-return rule applies at each step:

```python
def ring_bell():
    print("Ding")

def lunch_time():
    print("Lunch time, everyone")
    ring_bell()

print("Morning class")
lunch_time()
print("Back to work")
```

```text
Morning class
Lunch time, everyone
Ding
Back to work
```

The two `def` blocks print nothing as Python passes them. The first output comes from the first line outside a function. `lunch_time()` then runs its own two lines, and the second of those runs `ring_bell()`, before Python returns to print `Back to work`. Because a `def` is an ordinary statement, it must come above the first call: calling a function before Python has reached its `def` is a `NameError`.

The brackets are what make a call. The name on its own refers to the function without running it:

```python
def ring_bell():
    print("Ding")

ring_bell
print("No bell yet")
ring_bell()
print(ring_bell())
```

```text
No bell yet
Ding
Ding
None
```

Line 4 mentions the function and does nothing with it, so there is no output and no error. `ring_bell()` prints `Ding` by itself. The last line calls the function, which prints `Ding`, and then prints what the call handed back. `ring_bell` has no `return`, so that is [None](/handbook/none).

## Common mistakes

- **Expecting the lines inside a `def` to run straight away.** A `def` is a definition, like writing down a recipe. Nothing happens until the function is called, however many lines it has.
- **Wrapping every call in `print()`.** A function that prints does its own printing; `ring_bell()` on its own line is enough. Wrapping it in `print()` adds a stray `None` underneath. Use `print(...)` around a call only when the function [returns](/handbook/return-values) a value you want to see.
- **Leaving off the brackets.** `ring_bell` is the function itself, not a call to it, and Python won't complain. `print(ring_bell)` shows a description such as `<function ring_bell at 0x...>` instead of `Ding`. Add `()` to run it.

## Related

Functions take values in through [parameters](/handbook/parameters) and hand results back with [return](/handbook/return-values). Variables made inside a function belong to it; see [scope](/handbook/scope). [The call stack](/handbook/call-stack) shows how Python keeps track of which function it is in, and [docstrings](/handbook/docstrings) are how you describe what one does.
