`and`, `or` and `not` are Python's Boolean operators. They combine true-or-false tests into one: `and` needs both sides to be true, `or` needs at least one, and `not` flips a single test. They let one `if` check several things at once, such as "before 7 or after 19". Each side is a complete test of its own, and forgetting that is behind the most common mistake with `or`.

## How it works

`or` doesn't share the comparison on its left with the value on its right. Python groups `cargo == "dog" or "pram"` as `(cargo == "dog") or "pram"`:

```python
cargo = "bike"
print(cargo == "dog" or "pram")
print(cargo == "dog" or cargo == "pram")
print(cargo in ("dog", "pram"))
if cargo == "dog" or "pram":
    print("Half fare")
```

```text
pram
False
False
Half fare
```

The first line prints `pram`, not `False`. `or` gives back its left side if that counts as true, and otherwise its right side. Here the left side is `False`, so the result is the text `"pram"`, which counts as true because it isn't empty. If `cargo` were `"dog"`, the result would be `True`. Either way the `if` passes, whatever the cargo. Write the comparison out on both sides, or use `in` with the allowed values.

`and` and `or` also stop as soon as they know the answer: `and` skips its right side if the left is `False`, and `or` skips it if the left is `True`. That lets the left side guard the right:

```python
count = 0
total = 0
print(count > 0 and total / count > 5)
```

```text
False
```

`count > 0` is `False`, so the division never happens. With the sides swapped, it crashes with a ZeroDivisionError.

When you mix them, `not` is worked out first, then `and`, then `or`. So `is_member and age < 16 or age >= 65` means `(is_member and age < 16) or age >= 65`, which lets in every pensioner, member or not. Brackets say what you mean: `is_member and (age < 16 or age >= 65)`.

## Common mistakes

- **Using `and` where you mean `or`.** "Night fare before 7 and after 19" sounds right in English, but `hour < 7 and hour >= 19` is always `False`, because no hour is both. A value outside a range needs `or`; a value inside one needs `and`.
- **Expecting `x == "a" or "b"` to check both values.** It always passes, as shown above. Write `x == "a" or x == "b"`, or `x in ("a", "b")`.
- **Thinking `or` means one or the other but not both.** Python's `or` is `True` when both sides are. If you need exactly one, compare the two bools with `!=`.
- **Leaving out half a comparison.** `hour < 7 or >= 19` is a SyntaxError. Each side needs its own value: `hour < 7 or hour >= 19`.

## Related

The tests being combined are [comparisons](/handbook/comparisons), and a range check such as `7 <= hour < 19` can often replace an `and`. For which values count as true, see [True and False](/handbook/bool); for checking one value against several, see [in](/handbook/in-operator).
