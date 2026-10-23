import csv
import io

HEADER = ["title", "author", "year", "shelf"]
NEW_BOOK = ["Notes on Gulls", "R. Pennant", "1971", "N1"]


def catalogue_rows(result):
    text = result.files_out.get("catalogue.csv", result.files.get("catalogue.csv", ""))
    return text, list(csv.reader(io.StringIO(text)))


def old_books_kept(ctx):
    result = ctx.run_program()
    text, rows = catalogue_rows(result)
    if not rows or rows[0] != HEADER:
        raise CheckFailed("The header line has gone from catalogue.csv.", expected="title,author,year,shelf", actual=text)
    if len(rows) != 7 or rows[1][0] != "Emma":
        raise CheckFailed("catalogue.csv should still hold the five old books, with the new one after them.", actual=text)
    if rows[-1] != NEW_BOOK:
        raise CheckFailed("Notes on Gulls should be the last line of catalogue.csv.", actual=text)


TESTS = [
    output("Six books", expect="6 books", visible=True,
           hint="Opening with \"w\" empties the file first. Open it in a mode that adds to the end."),
    custom("The old books are still there", old_books_kept),
    output("A shorter catalogue", files={"catalogue.csv": "title,author,year,shelf\nEmma,Jane Austen,1815,A3\n"},
           expect="2 books"),
]
