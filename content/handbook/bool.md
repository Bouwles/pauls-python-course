A Python bool (short for Boolean) is a value that can only be `True` or `False`. It is the answer to a yes-or-no question: is the hour 19 or later, is the list empty, did the user type "yes". Every comparison produces one, every `if` and `while` makes its decision with one, and you can store one in a variable to give a test a readable name. `True` and `False` are written with a capital letter and no quotes; they are values in their own right, not text.

## How it works

A comparison gives back a bool, so you can save the answer and use it later, as many times as you like:

```python
hour = 20
temp = 1.5
is_night = hour >= 19
is_warm = temp >= 2
print(is_night, is_warm)
if is_night:
    print("Lights on")
if not is_warm:
    print("Wear a coat")
```

```text
True False
Lights on
Wear a coat
```

`if is_night:` is enough on its own. Writing `if is_night == True:` works, but the comparison only gives back the bool you already had. Names that start with `is_`, `has_` or `can_` make the code read like a sentence.

Other values can stand in for a bool too. Python treats `0`, empty text `""`, an empty list and `None` as false, and almost everything else as true. The `bool()` function shows which way a value goes:

```python
print(bool(0), bool(7))
print(bool(""), bool("False"))
print("True" == True)
print(type(True), type("True"))
```

```text
False True
False True
False
<class 'bool'> <class 'str'>
```

`bool("False")` is `True` because the text isn't empty. `bool()` doesn't read the word; it only checks whether there is any text at all. And the text `"True"` is not equal to the value `True`, because one is a string and the other is a bool.

## Common mistakes

- **Putting quotes round `True`.** `running = "True"` stores four letters of text. It prints the same as the bool, which hides the problem, but `running == True` is `False`. Leave the quotes off.
- **Writing `true` or `false` in lower case.** Python only knows the capitalised versions. Lower-case `true` is an unknown name, so you get `NameError: name 'true' is not defined. Did you mean: 'True'?`.
- **Turning typed answers into a bool with `bool()`.** [input()](/handbook/input-returns-text) always gives back text, and any non-empty text, including `"no"` and `"False"`, becomes `True`. Compare the text instead: `wants_ticket = answer == "yes"`.

## Related

Bools come from [comparisons](/handbook/comparisons), are combined with [and, or and not](/handbook/boolean-operators), and decide which branch runs in [if, elif and else](/handbook/if-elif-else). Use [type()](/handbook/type-function) to check whether a value is a bool or a string.
