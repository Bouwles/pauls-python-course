A Python `for` loop repeats a block of code once for each item in a sequence: each number in a `range()`, each character in a string, each item in a list. You use it whenever the same steps should happen several times, so you write them once instead of copying lines. The loop is made of two parts: a header line, `for name in something:`, ending in a colon, and the indented lines under it, called the body. Python decides what belongs to the body purely from the indentation.

## How it works

The thing after `in` can be anything Python can step through. A string gives its characters one at a time; a list gives its items in order:

```python
for letter in "oar":
    print(letter)
for boat in ["Kittiwake", "Mary Rose"]:
    print("Checking", boat)
    print("Done with", boat)
print("All boats checked")
```

```text
o
a
r
Checking Kittiwake
Done with Kittiwake
Checking Mary Rose
Done with Mary Rose
All boats checked
```

Each pass runs the whole body, top to bottom, before the next pass starts: both `print` lines for `Kittiwake`, then both for `Mary Rose`. The last line is back at the left edge, so it is not part of either loop. It runs once, after the second loop has finished. The body can be as many lines as you like, as long as they share the same indentation (four spaces is the convention).

A header with no indented line under it isn't a loop at all, and Python refuses to run the file:

```python
for sweep in range(3):
print("Sweep")
```

```text
  File "main.py", line 2
    print("Sweep")
    ^^^^^
IndentationError: expected an indented block after 'for' statement on line 1
```

A missing colon at the end of the header is a similar early stop: `SyntaxError: expected ':'`.

## Common mistakes

- **Expecting a line after the loop to repeat.** A line back at the left edge comes after the loop and runs once, when the loop is done. That is what you want for a final total; if the line should happen on every pass, indent it to match the body.
- **Thinking only the first indented line repeats.** Every line indented under the header is in the body, and all of them run on every pass, in order. A later indented line does not wait for the loop to end.
- **Thinking the body runs only once.** It runs once per value: three times for `range(3)`, once per item for a list, and not at all for an empty list. If something happens once, it is outside the loop.

## Related

[range](/handbook/range) supplies the numbers for counting loops, and [the loop variable](/handbook/loop-variables) explains the name after `for`. To check what a loop really does, [trace it](/handbook/tracing-loops) pass by pass. When you don't know in advance how many passes you need, use a [while loop](/handbook/while-loops).
