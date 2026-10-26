Python's `input()` function shows a prompt, waits for the user to type something and press Enter, and gives back what they typed. It always gives it back as a string (`str`), even when the user types a number. So if you want to do arithmetic with the answer, you have to convert it first with `int()` for whole numbers or `float()` for decimals. Forgetting this step is one of the most common causes of wrong answers and crashes in a beginner's first programs.

## How it works

Here the user types `4`. What comes back is the text `"4"`, one character long, and the arithmetic operators treat it as text:

```python
count = input("How many crates? ")
print(type(count))
print(count + count)
print(count * 3)
crates = int(count)
print(crates * 3)
```

```text
How many crates? 4
<class 'str'>
44
444
12
```

`count + count` joins two strings, giving `44`. `count * 3` repeats the string three times, giving `444`. Neither line crashes, which is what makes this mistake slippery: the program runs and prints a confident wrong answer. Only after `int(count)` is there a number, and `crates * 3` gives 12.

The usual pattern converts the answer on the same line it is read, so the variable never holds the text at all:

```python
price = float(input("Price? "))
quantity = int(input("Quantity? "))
print(f"Total: £{price * quantity:.2f}")
```

```text
Price? 2.5
Quantity? 3
Total: £7.50
```

Python works from the inside out: `input()` runs first and hands its text to `float()` or `int()`. Note the space at the end of each prompt. `input()` prints the prompt exactly as written, so without that space the answer would be typed hard up against the question mark.

If the user types something the conversion can't read, such as `2.5` into `int()`, or presses Enter without typing anything (which gives the empty string `""`), the program stops with a [ValueError](/handbook/value-error).

## Common mistakes

- **Thinking `input()` gives back a number when digits are typed.** It never does. `input("Age? ") + 1` is a [TypeError](/handbook/type-error), because it tries to add a number to text. Wrap the call: `int(input("Age? "))`.
- **Expecting text times a number to be an error.** It isn't: a string times a whole number repeats the string. So forgetting to convert an answer before multiplying gives a wrong result with no error to warn you.
- **Expecting repeated text to have spaces between the copies.** `"3" * 2` is `"33"`, not `"3 3"`. Repetition puts the copies side by side with nothing between them. If you want a gap, it has to be part of the string being repeated.

## Related

The two conversions have their own pages: [int()](/handbook/int-conversion) and [float()](/handbook/float-conversion). When you are not sure what a variable holds, [type()](/handbook/type-function) will tell you. To keep asking until the user types something valid, see [defensive input](/handbook/defensive-input).
