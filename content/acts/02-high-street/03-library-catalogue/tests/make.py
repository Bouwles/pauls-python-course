import csv
import io

HEADER = ["title", "author", "year", "shelf"]
ORIGINAL = [
    ["Emma", "Jane Austen", "1815", "A3"],
    ["The Riddle of the Sands", "Erskine Childers", "1903", "C1"],
    ["Tides, Currents and the North Quay", "Agnes Rook", "1998", "H2"],
    ["Moby-Dick", "Herman Melville", "1851", "C4"],
    ["A Field Guide to Gulls", "R. Pennant", "1968", "N1"],
]
ADDED = [
    ["The Saltmarsh Almanac", "Old Tom", "1987", "L2"],
    ["Knots, Unexplained", "Captain Ferro", "2004", "K1"],
]
REPORT = (
    "Emma is already catalogued.\n"
    "Added: The Saltmarsh Almanac\n"
    "Added: Knots, Unexplained\n"
    "The catalogue has 7 books."
)
DONATIONS_HEADER = "title,author,year,shelf\n"


def as_csv(rows):
    out = io.StringIO()
    csv.writer(out, lineterminator="\n").writerows(rows)
    return out.getvalue()


def catalogue_after(result):
    text = result.files_out.get("catalogue.csv", result.files.get("catalogue.csv", ""))
    return text, list(csv.reader(io.StringIO(text)))


def saved_catalogue(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    text, rows = catalogue_after(result)
    expected = [HEADER] + ORIGINAL + ADDED
    if rows != expected:
        raise CheckFailed("catalogue.csv should hold the header, the five old books, then the two new ones, in that order.",
                          expected=as_csv(expected), actual=text)


def no_donations_file(ctx):
    saved = ctx.files
    ctx.files = {name: text for name, text in saved.items() if name != "donations.csv"}
    try:
        result = ctx.run_program()
    finally:
        ctx.files = saved
    if result.error is not None:
        raise CheckFailed(f"With no donations.csv, the program crashed: {type(result.error).__name__}: {result.error}")
    if result.lines() != ["No donations today."]:
        raise CheckFailed("With no donations.csv, the program should print No donations today. and nothing else.",
                          expected="No donations today.", actual=result.output)
    text, rows = catalogue_after(result)
    if rows != [HEADER] + ORIGINAL:
        raise CheckFailed("With no donations, catalogue.csv should be left as it was.", expected=as_csv([HEADER] + ORIGINAL), actual=text)


TESTS = [
    output("Mrs Vance's box", expect=REPORT, visible=True),
    custom("The catalogue file afterwards", saved_catalogue, visible=True),
    output("Another box", files={"donations.csv": DONATIONS_HEADER + "Moby-Dick,Herman Melville,1851,C4\nNotes on Gulls,R. Pennant,1971,N1\n"},
           expect="Moby-Dick is already catalogued.\nAdded: Notes on Gulls\nThe catalogue has 6 books."),
    output("Two copies of one new book", files={"donations.csv": DONATIONS_HEADER + "Notes on Gulls,R. Pennant,1971,N1\nNotes on Gulls,R. Pennant,1971,N1\n"},
           expect="Added: Notes on Gulls\nNotes on Gulls is already catalogued.\nThe catalogue has 6 books.",
           hint="Once a book is added, its title is catalogued. A second copy in the same box is a duplicate."),
    output("A smaller catalogue", files={"catalogue.csv": "title,author,year,shelf\nEmma,Jane Austen,1815,A3\n",
                                         "donations.csv": DONATIONS_HEADER + "Persuasion,Jane Austen,1817,A3\n"},
           expect="Added: Persuasion\nThe catalogue has 2 books.",
           hint="Count the books in the catalogue as it is now, rather than writing a number in."),
    output("An empty box", files={"donations.csv": DONATIONS_HEADER}, expect="No donations today.",
           hint="A donations file with only the header line has no books in it."),
    custom("No donations file at all", no_donations_file,
           hint="If donations.csv doesn't exist, load_books gives back an empty list, and that means no donations."),
    function("load_books reads a file", call="load_books", args=("shelf.csv",),
             files={"shelf.csv": "title,author,year,shelf\nPersuasion,Jane Austen,1817,A3\n"},
             expect=[{"title": "Persuasion", "author": "Jane Austen", "year": "1817", "shelf": "A3"}],
             hint="load_books should give back a list with one dictionary per book, keyed by the header."),
    function("load_books with no file", call="load_books", args=("nowhere.csv",), expect=[],
             hint="Check whether the file exists first, and give back an empty list if it doesn't."),
]
