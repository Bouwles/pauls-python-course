Python's `str()` function converts a value to a string: `str(4)` gives the text `"4"`. You need it when you want to join a number onto text with `+`, because Python will not mix the two by itself. It works on any value, numbers or otherwise, and the text it gives back is the same text `print()` would show for that value. `str()` is the opposite of `int()` and `float()`, which turn text into numbers.

## How it works

`str()` builds a new piece of text from the value you give it. Once you have text, everything that works on text works on it: joining with `+`, measuring with `len()`, looking at single characters.

```python
boats = 4
price = 2.4
print("Boats in: " + str(boats))
print("Total: " + str(price * 3))
print(f"Total: {price * 3:.2f}")
print(str(True), str(None), str([1, 2]))
print(len(str(2026)))
```

```text
Boats in: 4
Total: 7.199999999999999
Total: 7.20
True None [1, 2]
4
```

The second line shows the limit of `str()`: it converts, but it doesn't format. A float comes out with every digit Python needs to describe it, so `2.4 * 3` shows as `7.199999999999999`. To control decimal places, use an [f-string](/handbook/f-strings) with `:.2f`, as the third line does. The last line counts the digits in a number by turning it into text first.

`str()` doesn't change the variable you pass in. It hands back a new value, and the original keeps its type:

```python
day = 14
label = str(day)
print(label + label)
print(day + day)
print(label == day)
print(int(label) == day)
```

```text
1414
28
False
True
```

`label` is the text `"14"`, so `+` joins it to itself. `day` is still the number 14, so `+` adds. And the text `"14"` is never equal to the number 14, however alike they look: in Python a string never equals a number. `int()` turns the text back into a number.

## Common mistakes

- **Thinking `str(2) + str(3)` adds the numbers.** After conversion they are text, and `+` on text joins: the result is `"23"`. If you want the sum as text, do the arithmetic first and convert the answer: `str(2 + 3)` is `"5"`.
- **Expecting `+` to join text and a number without converting.** `"Boats in: " + 4` stops with a [TypeError](/handbook/type-error). Python won't guess whether you meant to join or to add, so you have to say: `str(4)` for text, or `int("4")` for a number.

## When to use it

For a sentence with values in it, an f-string is usually shorter and easier to read than a chain of `+` and `str()`. Reach for `str()` when you need the text as a value of its own: to count digits, to compare with other text, or to [join](/handbook/split-join) a list of numbers, since `.join()` accepts only strings. Going the other way, from text to a number, is the job of [int()](/handbook/int-conversion) and [float()](/handbook/float-conversion).
