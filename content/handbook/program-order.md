Python runs a program one line at a time, starting at the top of the file and working down to the bottom. Each line finishes before the next one starts, and a line can only use what the lines above it have already set up. That sounds too obvious to need saying, but a lot of early confusion comes down to order: a variable used before it has a value, or a hope that changing a value later will fix what was already printed. If you can read a program in the order Python reads it, you can predict what it will do.

## How it works

Python treats the file as a list of instructions. It carries out the first one completely, then moves on to the next:

```python
total = 4
print("Total:", total)
total = total + 3
print("Total:", total)
```

```text
Total: 4
Total: 7
```

The first `print` shows 4 because that is what `total` held when that line ran. Changing `total` on line 3 does not reach back and alter what line 2 printed. Once something is on the screen, it stays there.

Order also decides whether a name exists yet. Here the second line uses `fare` before any line has given it a value:

```python
print("Starting")
print(fare)
fare = 2.5
```

```text
Starting
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    print(fare)
          ^^^^
NameError: name 'fare' is not defined
```

`Starting` appears because line 1 ran before the crash. Line 3 never runs: Python stops at the first error, and an assignment further down is no help to the line above it.

An `if` can skip lines, a loop can repeat them, and a function runs its lines only when called. All three work inside the same rule: Python is always on exactly one line, and it got there from the line before.

## Common mistakes

- **Expecting Python to sort out the order for you.** Python never rearranges lines to make them work. (It does read the whole file before starting, which is why one [SyntaxError](/handbook/syntax-error) stops everything, but it still runs the lines in order.) If a line needs a value, the line that makes it has to come first. Move the assignment above the line that uses it.
- **Thinking a later line can change earlier output.** Output is a record of what happened, written as it happened. If a printed number is wrong, fix the value before the `print`, not after it.
- **Reading from the middle.** When a result surprises you, start at the top and follow the lines down, noting each variable's value as it changes. The surprise is usually a line that runs earlier or later than you assumed.

## Related

The output in these examples comes from [print()](/handbook/print), and the values being passed along are held in [variables](/handbook/variables). When a program stops part-way, [reading the traceback](/handbook/reading-tracebacks) tells you which line it reached.
