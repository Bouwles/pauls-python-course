Python's `type()` function tells you what type a value is: `int` for whole numbers, `float` for decimals, `str` for text, `list`, `bool`, `NoneType` and so on. Every value in Python has a type, and the type decides what you can do with it: you can add two numbers, but you can't add a number to a string. When a program gives a strange answer or a TypeError, checking the type of a variable with `type()` is often the quickest way to find out why.

## How it works

`print()` alone can hide a type. The text `"12"` and the number `12` print exactly the same, so the screen can't tell you which one you have. `type()` can:

```python
typed = "12"
stored = 12
print(typed, stored)
print(type(typed), type(stored))
print(type(10 / 2), type(10 // 2))
print(type(None), type([typed, stored]))
```

```text
12 12
<class 'str'> <class 'int'>
<class 'float'> <class 'int'>
<class 'NoneType'> <class 'list'>
```

The output reads `<class 'str'>` because in Python a type is a class, and `type()` gives back the class itself. The third line catches many people out: `/` always gives a float, even when it divides exactly, while `//` gives an `int`.

Because `type()` gives back a class, compare it with the class name written without quotes. When code needs to check a type, `isinstance()` is usually the better tool, since it answers yes or no and can accept several types at once:

```python
answer = "12"
print(type(answer) == str)
print(type(answer) == "str")
print(isinstance(answer, str))
print(isinstance(2.5, (int, float)))
```

```text
True
False
True
True
```

`isinstance()` also says yes for related types: `True` counts as an `int`, because `bool` is a kind of `int` in Python.

## Common mistakes

- **Thinking `type()` gives back the value, or converts it.** `type("3")` is the class `str`, not the number 3 and not the text `"3"`. It describes the value and leaves it alone. To change a value's type, call the type: `int("3")`, `float("3")`, `str(3)`.
- **Expecting `input()` to give back a number when digits are typed.** `type(input())` is always `str`, whatever the user types, so checking it tells you nothing new. To find out whether an answer can be read as a number, attempt `int(answer)` inside a [try block](/handbook/try-except) and catch the `ValueError`.
- **Comparing a type with a string.** `type(answer) == "str"` is always `False`, because a class is never equal to a piece of text. Write `type(answer) == str`, or better, `isinstance(answer, str)`.

## Related

Answers from [input()](/handbook/input-returns-text) are always text; [int()](/handbook/int-conversion), [float()](/handbook/float-conversion) and [str()](/handbook/str-conversion) convert between the three basic types. When a value has the wrong type for an operation, Python raises a [TypeError](/handbook/type-error). The type of `None` is explained under [None](/handbook/none).
