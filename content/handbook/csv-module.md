The Python `csv` module reads and writes CSV files: the comma-separated text that spreadsheets export and import. Each line is a row and commas separate the columns, but a value can contain a comma of its own, so CSV wraps that value in double quotes. Splitting each line with `.split(",")` gets this wrong; the `csv` module gets it right. `csv.DictReader` gives each row as a dictionary keyed by the header line, so you can write `row["copies"]` instead of remembering that copies are column 1, and `csv.DictWriter` writes dictionaries back out.

## How it works

`DictWriter` needs to be told the column names, in order. `writeheader()` writes them as the first line, and `writerows()` writes one line per dictionary:

```python
import csv

books = [
    {"title": "Knots, Unexplained", "copies": 3},
    {"title": "Train Times", "copies": 2},
]
with open("books.csv", "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=["title", "copies"])
    writer.writeheader()
    writer.writerows(books)

with open("books.csv") as file:
    print(file.read())
```

```text
title,copies
"Knots, Unexplained",3
Train Times,2
```

The writer put quotes round the one title with a comma inside, and only that one. Reading it back with `DictReader` takes the quotes away again:

```python
import csv

with open("books.csv", newline="") as file:
    rows = list(csv.DictReader(file))

print(len(rows))
print(rows[0])
print(sum(int(row["copies"]) for row in rows))

line = '"Knots, Unexplained",3'
print(line.split(","))
```

```text
2
{'title': 'Knots, Unexplained', 'copies': '3'}
5
['"Knots', ' Unexplained"', '3']
```

There are two rows, not three: `DictReader` used the header line for the keys and did not hand it back as a row. The number of copies came back as the text `'3'`, so the total needed `int()`. The last line shows what `.split(",")` makes of the same line: three pieces, with the quote marks left in.

`newline=""` is there because the `csv` module handles line endings itself. Without it, Python's own handling gets in the way, which shows up on Windows as a blank line after every row written, and can break a quoted value that has a line break inside it.

## Common mistakes

- **Splitting lines on commas.** `.split(",")` knows nothing about quotes, so any value with a comma inside breaks into pieces and the columns shift along. Use `csv.reader` or `csv.DictReader`.
- **Expecting numbers back.** Every value the `csv` module reads is a string, even `'3'`. Convert with `int()` or `float()` before doing arithmetic, or you'll get a TypeError, or `'3' + '2'` giving `'32'`.
- **Expecting `DictReader` to give the header as a row.** It reads the first line as the column names and starts the rows at the line after. (The plain `csv.reader` does give the header back as its first row.)
- **Leaving out `newline=""`.** Pass it every time you open a file for the `csv` module, for reading and for writing.

## Related

Opening, writing and reading the file itself is covered in [reading and writing files](/handbook/files) and [with blocks](/handbook/with-statement). Each row from `DictReader` is one of Python's [dictionaries](/handbook/dictionaries), and its values need [int()](/handbook/int-conversion) before you can add them up.
