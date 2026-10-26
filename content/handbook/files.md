To read or write a text file in Python, open it with `open()`, which gives you a file object, then call `.read()` or `.write()` on it. The second argument to `open()` says what you mean to do: leave it out to read, use `"w"` to write the file from scratch, or `"a"` to add to the end. Files are how a program keeps anything after it stops running: a log, a saved list, a record of what happened. Most code opens files inside a `with` block, which closes them again automatically.

## How it works

`.write()` puts down exactly the text you give it, straight after whatever was written before. It adds nothing of its own, not even a line break. Reading the file back shows where the lines really end:

```python
with open("notes.txt", "w") as notes:
    notes.write("Overdue: 3")
    notes.write("Lost: 1\n")
    notes.write("Found: 2\n")

with open("notes.txt") as notes:
    print(notes.readlines())

with open("notes.txt") as notes:
    for line in notes:
        print(line.strip())
```

```text
['Overdue: 3Lost: 1\n', 'Found: 2\n']
Overdue: 3Lost: 1
Found: 2
```

The first `write` had no `"\n"`, so the second one carried on along the same line. `.readlines()` gives a list of lines with each `"\n"` still attached. Looping over the file gives the same lines one at a time, which is gentler on memory for a big file. `.strip()` removes the line break; without it, `print()` would add a second one and leave a blank line after every row.

The mode matters most for a file that already exists, and reading needs a file that does:

```python
with open("notes.txt", "w") as notes:
    notes.write("Lost: 1\n")

with open("notes.txt") as notes:
    print(notes.readlines())

with open("ledger.txt") as ledger:
    print(ledger.read())
```

```text
['Lost: 1\n']
Traceback (most recent call last):
  File "main.py", line 7, in <module>
    with open("ledger.txt") as ledger:
         ~~~~^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'ledger.txt'
```

Opening `notes.txt` with `"w"` emptied it the moment it opened, so the three earlier lines are gone. A plain name like `"ledger.txt"` means a file in the folder the program runs from, so a file that sits somewhere else gives this error too.

If a file may contain characters such as `£` or `é`, pass `encoding="utf-8"` to `open()`, so the file reads the same on every computer.

## Common mistakes

- **Expecting `.write()` to end the line.** It doesn't, unlike `print()`. Add `"\n"` yourself at the end of each line.
- **Thinking each `.write()` replaces the last one.** Within one open file, every write goes after the one before. The file is only emptied when it is opened with `"w"`.
- **Using `"w"` to add to a file.** `"w"` empties an existing file as soon as it opens, even if you then write nothing. To keep what is there and add to the end, use `"a"`.
- **Expecting a missing file to read as empty.** Opening a file that doesn't exist for reading raises a FileNotFoundError. Check the name and folder, or catch the error with `try` and `except FileNotFoundError:` if the file is allowed to be missing.

## Related

[with blocks](/handbook/with-statement) explain what closing a file does. For rows and columns, use the [csv module](/handbook/csv-module), and for finding files in other folders, see [paths](/handbook/paths). Catching the missing-file error is covered in [try and except](/handbook/try-except).
