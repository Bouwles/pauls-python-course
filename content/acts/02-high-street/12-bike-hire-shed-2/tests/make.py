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
    book = m.Book("Carrying the Fire", "Michael Collins", 1974)
    expect_equal("A new book is on the shelf", book.status, m.Status.ON_SHELF)
    expect_equal("A new book has no borrower", book.borrower, None)
    expect_equal("str() of a book on the shelf", str(book), "Carrying the Fire, Michael Collins (1974): on the shelf")
    expect_equal("Two books with the same fields are ==", book == m.Book("Carrying the Fire", "Michael Collins", 1974), True)


def lending(ctx):
    m = module(ctx)
    book = m.Book("The Mechanic's Tale", "Steve Matchett", 1999)
    expect_equal("Lending a book on the shelf returns True", book.lend("Aaesha"), True)
    expect_equal("Now it's on loan", book.status, m.Status.ON_LOAN)
    expect_equal("to Aaesha", book.borrower, "Aaesha")
    expect_equal("str() of a book on loan", str(book), "The Mechanic's Tale, Steve Matchett (1999): on loan")
    expect_equal("Lending it again returns False", book.lend("Yahya"), False)
    expect_equal("and it's still with Aaesha", book.borrower, "Aaesha")
    book.give_back()
    expect_equal("Given back, it's on the shelf", book.status, m.Status.ON_SHELF)
    expect_equal("with no borrower", book.borrower, None)
    expect_equal("and can go out again", book.lend("Yahya"), True)


def reference(ctx):
    m = module(ctx)
    if not issubclass(m.ReferenceBook, m.Book):
        raise CheckFailed("ReferenceBook is a kind of Book: class ReferenceBook(Book):")
    style = m.ReferenceBook("House Style", "Paul", 2025)
    expect_equal("A reference book can't be lent", style.lend("Caitlin"), False)
    expect_equal("and stays on the shelf", style.status, m.Status.ON_SHELF)
    expect_equal("str() of a reference book", str(style), "House Style, Paul (2025): on the shelf, reference only")


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
    collins = m.Book("Carrying the Fire", "Michael Collins", 1974)
    matchett = m.Book("The Mechanic's Tale", "Steve Matchett", 1999)
    expect_equal("Adding a book returns True", library.add(collins), True)
    library.add(matchett)
    expect_equal("len(library) counts the books", len(library), 2)
    expect_equal("find is the same book that was added", library.find("carrying the fire") is collins, True)
    expect_equal("find of a book that isn't there", library.find("Lost Moon"), None)


def no_duplicates(ctx):
    m = module(ctx)
    library = m.Library()
    library.add(m.Book("Carrying the Fire", "Michael Collins", 1974))
    expect_equal("A second Carrying the Fire is refused, whatever its capitals", library.add(m.Book("CARRYING THE FIRE", "Michael Collins", 1974)), False)
    expect_equal("and the library still has one book", len(library), 1)


def shelf(ctx):
    m = module(ctx)
    library = m.Library()
    books = [m.Book("Carrying the Fire", "Michael Collins", 1974), m.ReferenceBook("House Style", "Paul", 2025),
             m.Book("The Mechanic's Tale", "Steve Matchett", 1999), m.Book("Fluent Python", "Luciano Ramalho", 2015)]
    for book in books:
        library.add(book)
    books[0].lend("Aaesha")
    books[3].lend("Riya")
    expect_equal("on_shelf gives the books not on loan, in the order they were added", [b.title for b in library.on_shelf()],
                 ["House Style", "The Mechanic's Tale"])
    expect_equal("on_shelf of an empty library", m.Library().on_shelf(), [])


def own_lists(ctx):
    m = module(ctx)
    one, two = m.Library(), m.Library()
    one.add(m.Book("Carrying the Fire", "Michael Collins", 1974))
    expect_equal("Adding to one library changed another", len(two), 0)


TESTS = [
    output("Neil's shelves", visible=True, expect="The library has 3 books\nCarrying the Fire, Michael Collins (1974): on loan\n"
           "House Style, Paul (2025): on the shelf, reference only\nOn the shelf: The Mechanic's Tale, House Style"),
    custom("Status, with two members", the_enum, visible=True),
    custom("A new book", a_new_book, hint="Fields with defaults go after the ones without: status and borrower come last."),
    custom("Lending and giving back", lending),
    custom("A reference book stays in", reference, hint="ReferenceBook changes only lend and __str__. It inherits everything else."),
    custom("ReferenceBook builds on Book", reference_uses_super),
    custom("The library has books", the_library, hint="Caitlin's way: Library keeps its books in self.books, a list made in __init__."),
    custom("One card per book", no_duplicates, hint="Before adding, find the title. If it's already there, return False."),
    custom("What's on the shelf", shelf, hint="A comprehension with an if at the end keeps only the books whose status is Status.ON_SHELF."),
    custom("Two libraries, two lists", own_lists, hint="Make the list in __init__, so each library has its own."),
]
