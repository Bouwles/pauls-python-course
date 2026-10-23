---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I've written the bit that adds one book to the catalogue. Short and sweet."
  - pip: "Added one book. Now there are none. That isn't how adding works."
dialogue_after:
  - pip: "So w means wipe, before it means write. I'll check what's in a file before I open it again."
hints:
  nudge: "What does opening a file with \"w\" do to what's already in it?"
  plan:
    - Run it and count the books
    - Find the open() that empties the file
    - Open it so new rows go on the end
  shape: |
    def add_book(path, book):
        with open(path, ___, newline="") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.writerow(book)
---
Mrs Vance's catalogue has five books. Pip's `add_book` should make it six. Run it.

Files open in three main modes: `"r"` reads (the default), `"w"` writes, and `"a"` appends.

Fix it so it prints `6 books`, and the five old books are still in `catalogue.csv` with the header above them.
