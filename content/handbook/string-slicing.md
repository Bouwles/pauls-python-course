Slicing a Python string means taking part of it by position. `name[0]` gets one character (an index), and `name[2:5]` gets a run of characters (a slice), which is how Python does what other languages call a substring. Positions start at 0, and negative positions count back from the end, so `name[-1]` is the last character. You use it to pick out initials, keep the last four digits of a number, drop a prefix, or reverse a word. A slice of a string is always another string, and the original is left as it was.

## How it works

A slice can take three numbers, `start:stop:step`, and each one is optional. Leave out `start` and it begins at the beginning; leave out `stop` and it runs to the end; the step says how far to move each time.

```python
boat = "Kittiwake"
print(boat[2:5])
print(boat[-4:])
print(boat[::2])
print(boat[::-1])
print(boat[5:2:-1])
```

```text
tti
wake
Ktiae
ekawittiK
wit
```

`boat[2:5]` takes positions 2, 3 and 4: it stops before 5, so it holds `stop - start` characters (as long as both are inside the string). `boat[::2]` takes every second character. A negative step walks backwards, and `[::-1]` with no start or stop walks the whole string from the end, which is the usual way to reverse text. With a negative step, `start` has to be the larger number: `boat[5:2:-1]` begins at position 5 and works down to position 3.

Slices and single positions behave differently at the edges:

```python
code = "SM42"
print(code[2:10])
print(code[10:] == "")
print(code[4])
```

```text
42
True
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    print(code[4])
          ~~~~^^^
IndexError: string index out of range
```

A slice asks for whatever is in a range, and stops quietly at the end; a range with nothing in it gives the empty string `""`. A single index asks for one particular character. `"SM42"` has positions 0 to 3, so there is nothing at 4 to hand back, and Python raises an IndexError instead of guessing.

## Common mistakes

- **Counting from 1.** The first character is at position 0, so `"SM42"[1]` is `"M"`, and the last is at `len(code) - 1`, or more simply `-1`. The same applies to slices: `name[1:]` starts at the second character and drops the first. To get the first three, write `name[:3]`.
- **Expecting the stop position to be included.** `"harbour"[1:3]` is `"ar"`, positions 1 and 2 only. One way to picture it: the numbers mark the gaps between characters, and the slice takes what lies between two gaps.
- **Trying to change a character through an index.** `name[0] = "B"` is a TypeError, because strings can't be changed. Build a new one with a slice instead: `name = "B" + name[1:]`.

## Related

Slicing works the same way on lists, covered in [slicing](/handbook/slicing), and [negative indices](/handbook/negative-indices) explains counting from the end. For why a string can't be edited in place, see [Strings can't be changed](/handbook/immutability).
