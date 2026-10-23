---
id: make
type: make
title: Make the donations program
on_pass: { vance: "One Emma, not two. And the new ones written in, in ink, so to speak." }
hints:
  nudge: "Before adding a donation, how will you know whether its title is already in the catalogue? And what should count as a title already there once you've added one?"
  plan:
    - "No file yet: start with an empty list"
    - Read the rows as dictionaries, inside with
    - "No donations: say so, and stop there"
    - Collect the catalogue's titles in a set
    - Add each new donation, and its title to the set
    - Write the header, then every row
    - Say how many books there are
  shape: |
    def load_books(path):
        if not Path(path).___():
            return []
        with open(path, newline="") as file:
            return list(csv.___(file))


    def save_books(path, books):
        with open(path, ___, newline="") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.___()
            writer.writerows(books)


    catalogue = load_books("catalogue.csv")
    donations = load_books("donations.csv")
    if len(donations) == 0:
        print("No donations today.")
    else:
        titles = set()
        for book in catalogue:
            titles.add(book["title"])
        for book in donations:
            if book["title"] in ___:
                print(f"{book['title']} is already catalogued.")
            else:
                catalogue.append(___)
                titles.add(___)
                print(f"Added: {book['title']}")
        save_books("catalogue.csv", catalogue)
        print(f"The catalogue has {___} books.")
---
Mrs Vance's donations are in `donations.csv`, with the same columns as the catalogue. Make the program:

```
Emma is already catalogued.
Added: The Saltmarsh Almanac
Added: Knots, Unexplained
The catalogue has 7 books.
```

`load_books` takes a file name as text, like `"catalogue.csv"`. If there are no donations, print `No donations today.` and leave the catalogue alone.

The checks read `catalogue.csv` afterwards, not just what you print, and they try other boxes and other catalogues. A title with a comma in it has to survive the trip.
