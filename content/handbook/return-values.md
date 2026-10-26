A return value is what a Python function hands back to the code that called it. The `return` statement sends it, and the call then stands for that value, so you can store it (`total = get_total(prices)`), print it, or use it in a sum. Returning is how a function's work gets back out to the rest of the program: values made inside a function vanish when it ends, unless it returns them. It is also why a function can be tested: give it inputs, check what comes back.

## How it works

Printing and returning look alike when you try a function out, because both seem to produce the answer. They are different jobs. `print` shows text to a person; `return` gives a value to the program:

```python
def print_total(prices):
    print(sum(prices))

def get_total(prices):
    return sum(prices)

printed = print_total([2, 3])
returned = get_total([2, 3])
print("printed:", printed)
print("returned:", returned)
print(get_total([2, 3]) * 2)
```

```text
5
printed: None
returned: 5
10
```

The `5` on the first line comes from inside `print_total`. The caller got nothing back, so `printed` holds [None](/handbook/none). `get_total` printed nothing, but its value arrived, and on the last line the call is used directly in a sum.

`return` also ends the function on the spot, even in the middle of a loop. That makes it a tidy way to stop as soon as the answer is known:

```python
def find_parcel(parcels, name):
    for parcel in parcels:
        if parcel == name:
            return f"Found {name}"
        print(f"Not {parcel}")
    return f"No parcel for {name}"

print(find_parcel(["Tom", "Bea", "Nell"], "Bea"))
print(find_parcel(["Tom"], "Gwen"))
```

```text
Not Tom
Found Bea
Not Tom
No parcel for Gwen
```

In the first call Nell is never checked: the loop, the function and the call all finish at `return f"Found {name}"`. The last line of the function runs only when the loop ends without finding a match. A function can have several `return` statements this way, but each call goes through only one of them.

## Common mistakes

- **Printing a value and expecting the caller to receive it.** `print` inside a function sends the value to the screen, not back to the caller, and the call gives `None`. If other code needs the value, `return` it, and print it outside if you want to see it too.
- **Expecting lines after `return` to run.** Anything below a `return` in the same block is skipped. Code editors often grey it out. Move the line above the `return`, or out of the function.
- **Calling a function and not catching the result.** `add_point(score)` on its own line works out the new score and throws it away; `score` is unchanged, because Python doesn't store a returned value anywhere you didn't ask. Assign it: `score = add_point(score)`.

## Related

A function with no `return` hands back [None](/handbook/none). To hand back more than one value, see [returning several values](/handbook/multiple-returns). Why a function's own variables can't be reached from outside, and so need returning, is explained in [scope](/handbook/scope). Values go in through [parameters](/handbook/parameters).
