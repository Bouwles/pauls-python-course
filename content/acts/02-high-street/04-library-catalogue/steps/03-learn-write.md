---
id: learn-write
type: learn
title: Writing a file
concept: files
code: |
  with open("notes.txt", "w") as notes:
      notes.write("Words: 26628\n")
      notes.write("Most common: said\n")

  with open("notes.txt", "a") as notes:
      notes.write("Checked by Aaesha\n")

  with open("notes.txt") as notes:
      print(notes.read())
---
`open("notes.txt", "w")` opens a file for writing, and makes it if it isn't there. The `"w"` is the **mode**. `.write(text)` puts text in the file.

Aaesha's counts have to be written down somewhere they'll still be next week.

`.write()` writes exactly what you give it, and nothing more: no space and no new line. Put `"\n"` on the end for a new line.

`"w"` empties the file the moment it opens. To add to the end instead, open it with `"a"`, for append. With no mode at all, `open` reads.

The example writes two lines, adds a third, then prints all three.

The usual slip is opening with `"w"` to add a line. It wipes everything that was there first.
