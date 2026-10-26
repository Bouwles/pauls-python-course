Python's comparison operators check how two values relate and give back `True` or `False`. There are six: `<` (less than), `>` (greater than), `<=` (less than or equal to), `>=` (greater than or equal to), `==` (equal to) and `!=` (not equal to). They are how a program asks questions such as "is this over the limit" or "did they type yes", and the answer, a [bool](/handbook/bool), is what an `if` uses to decide what to do. A comparison is an ordinary expression, so you can print it or store it as well as test it.

## How it works

To check that a value sits between two limits, chain the comparisons, as you would in maths:

```python
hour = 20
print(0 <= hour < 24)
print(7 <= hour < 19)
is_late = hour >= 22
print(is_late)
```

```text
True
False
False
```

`0 <= hour < 24` means `0 <= hour and hour < 24`. Choose `<=` or `<` at each end to say whether that limit counts. Here 24 is out, which is right for hours.

Text can be compared too. `==` checks that two strings are exactly the same, and `<` and `>` put them in order one character at a time, using each character's code number:

```python
print("Bea" == "bea")
print("apple" < "banana")
print("Zebra" < "apple")
print(ord("Z"), ord("a"))
print("10" < "9")
```

```text
False
True
True
90 97
True
```

Capitals matter. `"Bea"` and `"bea"` are different, and every capital letter comes before every lower-case one, so `"Zebra"` sorts before `"apple"`. To compare without caring about case, lower both sides first: `name.lower() == "bea"`. The last line is a trap: comparing text that looks like numbers goes by characters, and `"1"` comes before `"9"`. Turn the text into numbers with `int()` before comparing.

## Common mistakes

- **Thinking `>` includes the number itself.** `16 > 16` is `False`. For "16 or over" or "at least 16", write `>= 16`.
- **Comparing with one equals sign.** `=` gives a value a name; `==` compares. `if hour = 20:` is a SyntaxError, and Python suggests the fix: `Maybe you meant '==' or ':=' instead of '='?`.
- **Comparing text with a number.** `"5" == 5` is `False` with no error, because a string is never equal to a number. `"5" < 5` crashes with a TypeError. This catches out programs that compare what [input()](/handbook/input-returns-text) returns. Convert first with [int()](/handbook/int-conversion).
- **Thinking comparisons only work inside an `if`.** `print(age >= 16)` prints `True` or `False`, and `is_adult = age >= 16` keeps the answer for later.

## Related

Combine comparisons with [and, or and not](/handbook/boolean-operators), and use them to choose a branch with [if, elif and else](/handbook/if-elif-else). To check whether a value is in a list or a string, use [in](/handbook/in-operator).
