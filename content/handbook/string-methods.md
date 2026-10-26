Python string methods are small built-in tools that every string carries with it. You call one by writing a dot after the string, then the method's name and brackets: `name.upper()`, `line.startswith("#")`, `code.find("-")`. They save you writing loops for everyday jobs such as changing case, searching, counting and checking what a piece of text contains. None of them alter the string you call them on. Each one hands back either a new string (`.upper()`, `.title()`, `.center()`) or an answer about the string: a number from `.count()` or `.find()`, or `True` or `False` from `.startswith()` and `.isdigit()`.

## How it works

The searching and checking methods answer questions without changing anything:

```python
code = "SM-0042"
print(code.find("-"))
print(code.find("X"))
print(code.endswith("42"))
print(code.isdigit())
print("0042".isdigit())
```

```text
2
-1
True
False
True
```

`.find()` gives the position of the first match, counting from 0, and `-1` when there is no match. `.endswith()` is the partner of `.startswith()`. `.isdigit()` is `True` only when every character is a digit, so it is a quick check before turning typed text into a number. Note that `"-5"` and `"4.5"` both fail it, because `-` and `.` are not digits.

`.index()` does the same search as `.find()`, but a missing match is an error instead of `-1`:

```python
code = "SM-0042"
print(code.index("-"))
print(code.index("X"))
```

```text
2
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(code.index("X"))
          ~~~~~~~~~~^^^^^
ValueError: substring not found
```

Use `.find()` when a missing match is normal and you will check for `-1`. Use `.index()` when the text should always be there, so a missing match stops the program at the line that assumed it.

## Common mistakes

- **Expecting capitals not to matter.** To Python, `"L"` and `"l"` are different characters, so `"Lost" == "lost"` is `False`, and so is `"lost oar".startswith("Lost")`. To compare text while ignoring case, lower both sides first: `reply.lower() == "yes"`.
- **Reading `.center(n)` as "add n on each side".** The number is the width of the finished string. `"ab".center(6, "-")` gives `--ab--`, six characters in all. A string already that wide or wider comes back unchanged.
- **Leaving off the brackets.** `notice.upper` names the method without running it. `print(notice.upper)` shows something like `<built-in method upper of str object at 0x...>`, and `if reply.lower == "yes":` is quietly always false. The brackets are what call it.
- **Expecting the string itself to change.** A line like `title.upper()` on its own does the work and throws the answer away. Keep the result: `title = title.upper()`.

## Related

Why the original never changes is covered in [Strings can't be changed](/handbook/immutability). For cleaning and cutting up text, see [strip() and replace()](/handbook/strip-replace) and [split() and join()](/handbook/split-join). Methods in general are explained in [methods](/handbook/methods).
