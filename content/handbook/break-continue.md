`break` and `continue` are the two Python statements that change how a loop runs from inside it. `break` stops a `for` or `while` loop at once and jumps to the first line after the loop. `continue` abandons the current pass and goes straight back to the top for the next one. Use `break` when you have found what you were looking for, or when a loop that could run for ever has a reason to stop. Use `continue` to skip items you don't want to handle, without wrapping the rest of the loop body in another `if`.

## How it works

The most common real use of `break` is in a `while True` loop: a loop that would never end on its own, with a `break` as its only way out. It suits "keep asking until they say stop", where you can't know in advance how many passes you need.

```python
total = 0
while True:
    answer = input("Weight in kg, or done: ")
    if answer == "done":
        break
    total = total + int(answer)
print("Total:", total, "kg")
```

```text
Weight in kg, or done: 12
Weight in kg, or done: 7
Weight in kg, or done: done
Total: 19 kg
```

When `answer` is `"done"`, the `break` runs and the line that adds to `total` is skipped for that pass. The `break` sits inside an `if`, but it is the loop it leaves, not the `if`.

With one loop inside another, both statements affect only the innermost loop they are in:

```python
rounds = [["Emma", "", "Ivo"], ["Rosa", "STOP", "Sam"], ["Lena"]]
for names in rounds:
    for name in names:
        if name == "":
            continue
        if name == "STOP":
            break
        print("Deliver to", name)
    print("End of round")
```

```text
Deliver to Emma
Deliver to Ivo
End of round
Deliver to Rosa
End of round
Deliver to Lena
End of round
```

The empty name is skipped by `continue`, and the loop moves on to `"Ivo"`. `"STOP"` ends the inner loop, so Sam is never reached, but `End of round` still prints and the outer loop carries on with the next round.

A loop can also have an `else` block, which runs only if the loop finished without hitting `break`. It is mostly used in searches, where the `else` is the place to handle "not found".

## Common mistakes

- **Expecting the rest of the pass to run.** `break` takes effect the moment it runs. Lines below it in the loop body are skipped, even in the same pass. If something must happen before leaving, put it above the `break`.
- **Thinking `break` stops the program.** It leaves one loop, and the program carries on from the line after that loop. To leave a whole function, use `return`.
- **Mixing up `break` and `continue`.** In English, "continue" means "carry on with what you were doing". In Python it means "skip the rest of this pass and carry on with the next one". `break` breaks out of the loop; `continue` continues with the loop's next pass.

## Related

`break` and `continue` work the same way in [for loops](/handbook/for-loops) and [while loops](/handbook/while-loops). A `while True` loop whose `break` can never be reached is an [infinite loop](/handbook/infinite-loops).
