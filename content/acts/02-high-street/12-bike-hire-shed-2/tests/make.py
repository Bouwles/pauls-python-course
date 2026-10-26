import dataclasses


def module(ctx):
    m = ctx.module()
    for name in ("Status", "Book", "ReferenceBook", "Library"):
        if not hasattr(m, name):
            raise CheckFailed(f"There is no {name} in library.py yet.")
    return m


def expect_equal(what, got, want):
    if got != want or (type(got) is bool) != (type(want) is bool):
        raise CheckFailed(what, expected=repr(want), actual=repr(got))


def the_enum(ctx):
    m = module(ctx)
    import enum
    if not (isinstance(m.Status, type) and issubclass(m.Status, enum.Enum)):
        raise CheckFailed("Status should be an Enum.")
    expect_equal("Status has exactly two members", [s.name for s in m.Status], ["ON_SHELF", "ON_LOAN"])
    expect_equal("Status.ON_LOAN's value", m.Status.ON_LOAN.value, "on loan")
    expect_equal("Status.ON_SHELF's value", m.Status.ON_SHELF.value, "on the shelf")


def a_new_book(ctx):
    m = module(ctx)
    if not dataclasses.is_dataclass(m.Book):
        raise CheckFailed("Book should be a dataclass: put @dataclass on the line above it.")
    book = m.Book("Emma", "Jane Austen", 1815)
    expect_equal("A new book is on the shelf", book.status, m.Status.ON_SHELF)
    expect_equal("A new book has no borrower", book.borrower, None)
    expect_equal("str() of a book on the shelf", str(book), "Emma, Jane Austen (1815): on the shelf")
    expect_equal("Two books with the same fields are ==", book == m.Book("Emma", "Jane Austen", 1815), True)


def lending(ctx):
    m = module(ctx)
    book = m.Book("The Riddle of the Sands", "Erskine Childers", 1903)
    expect_equal("Lending a book on the shelf returns True", book.lend("Bea"), True)
    expect_equal("Now it's on loan", book.status, m.Status.ON_LOAN)
    expect_equal("to Bea", book.borrower, "Bea")
    expect_equal("str() of a book on loan", str(book), "The Riddle of the Sands, Erskine Childers (1903): on loan")
    expect_equal("Lending it again returns False", book.lend("Pip"), False)
    expect_equal("and it's still with Bea", book.borrower, "Bea")
    book.give_back()
    expect_equal("Given back, it's on the shelf", book.status, m.Status.ON_SHELF)
    expect_equal("with no borrower", book.borrower, None)
    expect_equal("and can go out again", book.lend("Pip"), True)


def reference(ctx):
    m = module(ctx)
    if not issubclass(m.ReferenceBook, m.Book):
        raise CheckFailed("ReferenceBook is a kind of Book: class ReferenceBook(Book):")
    tides = m.ReferenceBook("Tide Tables 2026", "Agnes Rook", 2025)
    expect_equal("A reference book can't be lent", tides.lend("Ferro"), False)
    expect_equal("and stays on the shelf", tides.status, m.Status.ON_SHELF)
    expect_equal("str() of a reference book", str(tides), "Tide Tables 2026, Agnes Rook (2025): on the shelf, reference only")


def reference_uses_super(ctx):
    m = module(ctx)
    source = ctx.source
    start = source.find("class ReferenceBook")
    if start == -1 or "super()" not in source[start:]:
        raise CheckFailed("ReferenceBook's __str__ should build on Book's with super(), rather than writing the line out again.")


def the_library(ctx):
    m = module(ctx)
    library = m.Library()
    expect_equal("A new library holds a list called books, empty", library.books, [])
    emma = m.Book("Emma", "Jane Austen", 1815)
    riddle = m.Book("The Riddle of the Sands", "Erskine Childers", 1903)
    expect_equal("Adding a book returns True", library.add(emma), True)
    library.add(riddle)
    expect_equal("len(library) counts the books", len(library), 2)
    expect_equal("find is the same book that was added", library.find("emma") is emma, True)
    expect_equal("find of a book that isn't there", library.find("Moby-Dick"), None)


def no_duplicates(ctx):
    m = module(ctx)
    library = m.Library()
    library.add(m.Book("Emma", "Jane Austen", 1815))
    expect_equal("A second Emma is refused, whatever its capitals", library.add(m.Book("EMMA", "Jane Austen", 1815)), False)
    expect_equal("and the library still has one book", len(library), 1)


def shelf(ctx):
    m = module(ctx)
    library = m.Library()
    books = [m.Book("Emma", "Jane Austen", 1815), m.ReferenceBook("Tide Tables 2026", "Agnes Rook", 2025),
             m.Book("The Riddle of the Sands", "Erskine Childers", 1903), m.Book("Knots, Unexplained", "Captain Ferro", 2004)]
    for book in books:
        library.add(book)
    books[0].lend("Bea")
    books[3].lend("Tom")
    expect_equal("on_shelf gives the books not on loan, in the order they were added", [b.title for b in library.on_shelf()],
                 ["Tide Tables 2026", "The Riddle of the Sands"])
    expect_equal("on_shelf of an empty library", m.Library().on_shelf(), [])


def own_lists(ctx):
    m = module(ctx)
    one, two = m.Library(), m.Library()
    one.add(m.Book("Emma", "Jane Austen", 1815))
    expect_equal("Adding to one library changed another", len(two), 0)


TESTS = [
    output("Mrs Vance's library", visible=True, expect="The library has 3 books\nEmma, Jane Austen (1815): on loan\n"
           "Tide Tables 2026, Agnes Rook (2025): on the shelf, reference only\nOn the shelf: The Riddle of the Sands, Tide Tables 2026"),
    custom("Status, with two members", the_enum, visible=True),
    custom("A new book", a_new_book, hint="Fields with defaults go after the ones without: status and borrower come last."),
    custom("Lending and giving back", lending),
    custom("A reference book stays in", reference, hint="ReferenceBook changes only lend and __str__. It inherits everything else."),
    custom("ReferenceBook builds on Book", reference_uses_super),
    custom("The library has books", the_library, hint="Kat's way: Library keeps its books in self.books, a list made in __init__."),
    custom("One card per book", no_duplicates, hint="Before adding, find the title. If it's already there, return False."),
    custom("What's on the shelf", shelf, hint="A comprehension with an if at the end keeps only the books whose status is Status.ON_SHELF."),
    custom("Two libraries, two lists", own_lists, hint="Make the list in __init__, so each library has its own."),
]
