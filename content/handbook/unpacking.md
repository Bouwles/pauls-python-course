Unpacking in Python means taking a tuple or list apart into separate variables in one assignment: `chest, waist, leg = size` puts the first value in `chest`, the second in `waist` and the third in `leg`. It saves writing `size[0]`, `size[1]` and `size[2]`, and it gives each value a name that says what it is. The same idea, also called multiple assignment or tuple unpacking, lets a `for` loop name the parts of each item, lets a function hand back several results at once, and swaps two variables without a temporary one.

## How it works

Python counts the names on the left and the values on the right. If the counts match, each name gets the value in the same position. If not, nothing is assigned, and Python raises a ValueError:

```python
size = (101, 95, 79)
chest, waist = size
```

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    chest, waist = size
    ^^^^^^^^^^^^
ValueError: too many values to unpack (expected 2, got 3)
```

With one name too many, the message is `not enough values to unpack (expected 3, got 2)`. Either way, "expected" is how many names you wrote and "got" is how many values arrived.

A name with a star in front collects whatever is left over into a list. In a `for` loop, unpacking happens once for each item:

```python
first, *rest = ["Sam", "Lena", "Ivo", "Emma"]
print(first)
print(rest)

sizes = [("Lena", 96), ("Ivo", 101)]
for name, chest in sizes:
    print(f"{name}: {chest} cm")

low, high = 74, 88
low, high = high, low
print(low, high)
```

```text
Sam
['Lena', 'Ivo', 'Emma']
Lena: 96 cm
Ivo: 101 cm
88 74
```

The starred name always holds a list, even when it collects one item or none. It can go anywhere in the line (`first, *middle, last = route` keeps both ends), but only one name per assignment can have a star.

The swap on the last two lines works because Python finishes the right-hand side before it assigns anything. `high, low` becomes the tuple `(88, 74)` while both names still hold their old values, and only then is that tuple unpacked into `low` and `high`.

## Common mistakes

- **Expecting extra values to be dropped, or missing ones to be left blank.** Python never guesses which value you meant to leave out, and never fills a name with `None`. Write one name per value. To ignore a value, give it the name `_`, which by convention means "not used": `chest, _, leg = size`. If the number of values varies, use a starred name.
- **Thinking `a, b = b, a` leaves both names holding the same value.** That is what two separate lines, `a = b` then `b = a`, would do, because the first line overwrites `a` before the second runs. The one-line version builds the tuple first, so nothing is lost.

## Related

Unpacking works on anything you can loop over, most often [tuples](/handbook/tuples). It is how a caller receives [several values from a function](/handbook/multiple-returns), and it is what takes apart the pairs handed over by [zip()](/handbook/zip) and [enumerate()](/handbook/enumerate).
