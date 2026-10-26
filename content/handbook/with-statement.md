A `with` statement in Python opens something, lets you use it inside an indented block, and closes it automatically when the block ends. You will see it most often as `with open("notes.txt") as notes:`, and it is the recommended way to work with files because the file gets closed whether the block finishes normally, returns early or crashes with an error. Without it you have to remember to call `.close()` yourself, and an error halfway through would skip that line and leave the file open.

## How it works

The name after `as` refers to the open file inside the block. When Python leaves the block, by whatever route, it closes the file. Variables you made inside the block are ordinary variables and stay where they are:

```python
with open("shelf.txt", "w") as shelf:
    shelf.write("Emma\nIvo\n")

with open("shelf.txt") as shelf:
    names = shelf.read().split()

print(names)
print(shelf.closed)
print(shelf.read())
```

```text
['Emma', 'Ivo']
True
Traceback (most recent call last):
  File "main.py", line 9, in <module>
    print(shelf.read())
          ~~~~~~~~~~^^
ValueError: I/O operation on closed file.
```

`names` survives the end of the block, because a `with` block is not a separate space for variables, the way a function is. What ends is the file's open state. `shelf` still exists as well, but it now refers to a closed file, and reading from it raises a ValueError.

The closing happens even when the code inside the block crashes:

```python
try:
    with open("shelf.txt", "a") as shelf:
        shelf.write("Rosa\n")
        share = 10 / 0
except ZeroDivisionError:
    print("Crashed. Closed:", shelf.closed)

with open("shelf.txt") as shelf:
    print(shelf.read().split())
```

```text
Crashed. Closed: True
['Emma', 'Ivo', 'Rosa']
```

Rosa's line was saved, even though the block never finished. That matters because Python holds written text in memory and sends it to the disk in batches. Closing the file is what sends the last batch, so a file that is never closed can end up missing its final lines.

One `with` can open two files, separated by a comma: `with open("old.txt") as source, open("new.txt", "w") as copy:`. Files are the usual case, but other things that need tidying up afterwards, such as locks and network connections, work with `with` in the same way.

## Common mistakes

- **Using the file after the block.** Once the indented block ends, the file is closed, and reading or writing it raises `ValueError: I/O operation on closed file.` Read what you need inside the block, keep it in a variable, and work with the variable afterwards.
- **Thinking variables made inside the block disappear.** They don't. Anything you read into a variable is still there after the block; only the file is shut.
- **Putting the whole program inside the block.** It works, but it holds the file open for longer than needed. Keep the block to the lines that read or write, and do the rest of the work after it.

## Related

What you can do with a file inside the block is covered in [reading and writing files](/handbook/files), and the [csv module](/handbook/csv-module) uses `with` in the same way. To handle an error yourself rather than let it end the program, see [try and except](/handbook/try-except).
