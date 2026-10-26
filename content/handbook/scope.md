Scope is the part of a Python program where a variable's name can be used. A variable created inside a function is local: it exists only while that call runs and only inside that function. A variable created at the top level of the file is global, and every function can read it. Scope lets ten functions each have their own `total` without interfering, and it explains two puzzling errors: a `NameError` for a variable you are sure you made, and an `UnboundLocalError` for one that plainly exists.

## How it works

Assigning to a name inside a function creates a local variable, even when a global with the same name already exists. The two are separate, and the global is left alone:

```python
total = 100

def add_up(prices):
    total = 0
    for price in prices:
        total = total + price
    return total

print(add_up([2, 3, 4]))
print(total)
```

```text
9
100
```

The function's `total` starts at 0, reaches 9 and is returned, then disappears when the call ends. The global one never changed. Without the first line, `print(total)` at the bottom would be `NameError: name 'total' is not defined`, because the only `total` there was belonged to the call. A function's parameters, like `prices`, are local in the same way.

Reading a global from inside a function works. The trouble starts when one function both reads a global and assigns to the same name:

```python
rate = 2

def show_rate():
    print("Rate is", rate)

def raise_rate():
    rate = rate + 1

show_rate()
raise_rate()
```

```text
Rate is 2
Traceback (most recent call last):
  File "main.py", line 10, in <module>
    raise_rate()
    ~~~~~~~~~~^^
  File "main.py", line 7, in raise_rate
    rate = rate + 1
           ^^^^
UnboundLocalError: cannot access local variable 'rate' where it is not associated with a value
```

Python decides which names are local before a function runs, by looking for assignments anywhere in its body. `raise_rate` assigns to `rate`, so `rate` is local for the whole function, and the right-hand side tries to read that local before it has a value. `show_rate` never assigns, so it reads the global.

The fix is to pass the value in and return the new one: `def raise_rate(rate): return rate + 1`, called as `rate = raise_rate(rate)`. A `global rate` line inside the function would also work, but functions that quietly change globals are harder to follow and to test. Returning keeps every change visible at the line that makes it.

## Common mistakes

- **Expecting an assignment inside a function to change the variable outside.** It makes a new local variable with the same name, and the outside one is untouched. Return the new value and assign it outside.
- **Using a function's variable after the function has finished.** Locals disappear when the call ends, so outside the function the name is a `NameError`. Return the value if the caller needs it.
- **Calling a function and expecting the result to land in a variable.** `add_point(score)` on its own changes nothing: the returned value is thrown away unless you write `score = add_point(score)`.

## Related

Scope belongs to [functions](/handbook/functions), and [parameters](/handbook/parameters) are local variables filled by the call. [Return values](/handbook/return-values) are the usual way out. [Closures](/handbook/closures) are functions that keep using an outer function's variables.
