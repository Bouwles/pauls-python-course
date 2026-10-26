Python's `float()` function turns text or a whole number into a floating-point number, Python's type for numbers with a decimal point. You use it to read prices, weights and measurements that a user typed: `float("2.5")` gives 2.5. Floats are stored in binary, so many decimals are held as a very close approximation. That is why `0.1 + 0.2` prints `0.30000000000000004` in Python, and why you round floats when you show them.

## How it works

`float()` reads digits with an optional sign and decimal point, ignoring spaces around them. The result is a number, not text, so `"2.40"` loses its trailing zero, and whole numbers gain `.0`:

```python
print(float("2.40"))
print(float("7"), float(3))
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(f"{0.1:.20f}")
print(f"{0.3:.20f}")
```

```text
2.4
7.0 3.0
0.30000000000000004
False
0.10000000000000000555
0.29999999999999998890
```

A float is stored as a binary fraction: a sum of halves, quarters, eighths and so on, with about 16 significant digits. Values like 0.5 and 0.375 fit exactly. One tenth does not. In binary it repeats forever, the way one third is 0.3333... in decimal, so Python keeps the nearest value it can. Asking for 20 decimal places shows the gap. Normally Python prints the shortest decimal that leads back to the stored value, so 0.1 still prints as `0.1`. But the small errors in 0.1 and 0.2 add up, and the sum lands on the float next to the one stored for 0.3. It takes 17 digits to tell the two apart, and `==` says `False`.

To show a float neatly, format it, or round it:

```python
total = 0.1 + 0.2
print(f"{total:.2f}")
print(round(total, 2))
print(round(0.5), round(1.5), round(2.5))
print(round(2.675, 2))
```

```text
0.30
0.3
0 2 2
2.67
```

`:.2f` in an [f-string](/handbook/f-strings) only changes how the value looks. `round(total, 2)` gives a new float, and `round()` with no digits gives an `int`. When a value is exactly halfway, `round()` goes to the even neighbour, so 0.5 becomes 0 and 2.5 becomes 2. This is called round half to even, and it stops a long list of rounded values drifting upwards. `round(2.675, 2)` is 2.67 for a different reason: 2.675 is stored as slightly less than 2.675, so it was never a half.

## Common mistakes

- **Expecting float arithmetic to be exact.** Don't compare the result of a float calculation with `==`. Use `math.isclose(total, 0.3)`, which allows for a tiny error. For money, many programs store whole pence as an `int`, or use the `decimal` module, which works in base ten.
- **Using `int()` to read decimal text.** `int("2.5")` is a [ValueError](/handbook/value-error). Use `float()`, which also reads `"7"`, so it is the safe choice when an answer might have a decimal point.
- **Expecting halves always to round up.** `round(2.5)` is 2. If you need halves to go up, use the `decimal` module's `ROUND_HALF_UP`.

## Related

To make a whole number instead, see [int()](/handbook/int-conversion). Answers from [input()](/handbook/input-returns-text) arrive as text and need `float()` before any arithmetic.
