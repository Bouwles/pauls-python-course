A Python function can return more than one value by listing them after `return` with commas: `return smallest, largest`. Python packs them into a single tuple, and the caller usually unpacks that tuple straight away into separate variables: `low, high = size_range(sizes)`. This is the normal way to hand back two or three results that belong together, such as pounds and pence, a lowest and a highest, or a position and the item found there, without building a dictionary or a class to carry them.

## How it works

The commas make the tuple, not brackets. `return min(sizes), max(sizes)` and `return (min(sizes), max(sizes))` mean the same thing. Printing the call shows what actually comes back:

```python
def size_range(sizes):
    return min(sizes), max(sizes)


result = size_range([96, 112, 101])
print(result)
print(type(result))
print(result[1])

low, high = size_range([96, 112, 101])
print(f"From {low} to {high}")
```

```text
(96, 112)
<class 'tuple'>
112
From 96 to 112
```

`result` is one value, a tuple, and you can keep it whole, index into it or unpack it. Unpacking is usually the clearest, because each part gets a name at the moment it arrives. The usual unpacking rule applies: the number of names must match the number of values returned, or Python raises a ValueError such as `not enough values to unpack (expected 3, got 2)`.

`return` also ends the function as soon as it runs. Anything underneath it in the same function is never reached:

```python
def first_and_last(route):
    return route[0]
    return route[-1]


print(first_and_last(["Quay", "Mill", "Church"]))
```

```text
Quay
```

The second `return` is dead code: Python never gets to it, and it raises no error either. To send back both stops, put them in the same `return`: `return route[0], route[-1]`.

## Common mistakes

- **Thinking a function can only give back one value.** Strictly speaking it does return one thing, a tuple, but that tuple can hold as many values as you like. In practice, a function can return several.
- **Thinking `return a, b` gives back only `a`.** Both values come back, packed together. If you store the call in one variable, that variable holds the whole tuple `(a, b)`, not the first item.
- **Thinking `return a, b` hands back two separate things.** It is one tuple holding both. That is why printing the call shows brackets, `(96, 112)`, and why `len()` of the result is 2. Two names on the left are what split it into two variables.
- **Adding a second `return` to send another value.** The first `return` ends the function, so a second one underneath never runs and its value is lost. Put every value in the one `return`, separated by commas.

## Related

This combines [return values](/handbook/return-values) with [tuples](/handbook/tuples), and the caller's half of the job is [unpacking](/handbook/unpacking). When the values need names wherever they travel, not only at the moment of unpacking, a [dataclass](/handbook/dataclasses) is the next step up.
