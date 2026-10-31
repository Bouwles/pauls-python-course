Tracing a loop means working through it by hand, one pass at a time, writing down the value of every variable as Python would change it. It is the most reliable way to find out what a Python loop really does, as opposed to what you meant it to do, and it is how most loop bugs are found: a total that comes out wrong, a loop that runs one time too many, a value that never changes. The usual tool is a trace table, with one column per variable and one row per pass. A `print()` inside the loop produces the same table on screen, so you can check your hand trace against the real thing.

## How it works

This loop adds up a list of scores and keeps the largest:

```python
scores = [4, 9, 2, 9]
total = 0
best = 0
for score in scores:
    total = total + score
    if score > best:
        best = score
print(total, best)
```

```text
24 9
```

To trace it, make a column for the loop variable and for each variable the body changes, plus a first row for the values before the loop starts. Then fill in one row per pass, working through the body line by line and using the values from the row above:

```text
pass   score  total   best
start    -      0       0
1        4      4       4
2        9     13       9
3        2     15       9
4        9     24       9
```

In pass 3, `score > best` is `2 > 9`, which is false, so `best` stays at 9. In pass 4 it is `9 > 9`, also false: a score equal to the best doesn't replace it. That is the kind of detail a table forces you to notice and a quick read skips over.

To check the table, put a `print` at the end of the body, indented so it runs on every pass:

```python
scores = [4, 9, 2, 9]
total = 0
best = 0
for score in scores:
    total = total + score
    if score > best:
        best = score
    print(score, total, best)
```

```text
4 4 4
9 13 9
2 15 9
9 24 9
```

Each printed line matches a row. If one doesn't, the first row that differs shows the pass where your picture of the loop and Python's stopped agreeing.

## Common mistakes

- **Thinking `total = total + score` keeps only the last amount.** Python works out the right-hand side first, using the value `total` has now, then stores the result back in `total`. So the old value is carried forward each pass: 4, 13, 15, 24. The final total is the sum of everything, not the last score.
- **Setting the starting value inside the loop.** If `total = 0` is indented into the body, it resets on every pass and `total` ends up holding only the last amount after all. A trace table shows this at once, because the `total` column never grows.
- **Tracing in your head.** Writing the values down is the point. Skipping rows is how the surprising pass gets missed.

## Related

The loop itself is covered in [for loops](/handbook/for-loops), and what the name after `for` holds in [the loop variable](/handbook/loop-variables). Adding up as you go is a pattern of its own: see [running totals](/handbook/running-totals).
