def overdue_books(ctx):
    m = ctx.module()
    library = m.Library()
    emma = m.Book("Emma", "Jane Austen", 1815)
    riddle = m.Book("The Riddle of the Sands", "Erskine Childers", 1903)
    knots = m.Book("Knots, Unexplained", "Captain Ferro", 2004)
    for book in (emma, riddle, knots):
        library.add(book)
    emma.lend("Bea", today=300)
    riddle.lend("Tom", today=310)
    knots.lend("Gwen")
    knots.give_back()
    if emma.due != 321:
        raise CheckFailed("A book lent on day 300 is due on day 321.", expected=321, actual=emma.due)
    if knots.due is not None:
        raise CheckFailed("give_back clears the due day.", expected=None, actual=knots.due)
    got = [book.title for book in library.overdue(325)]
    if got != ["Emma"]:
        raise CheckFailed("On day 325, only Emma is overdue.", expected="['Emma']", actual=repr(got))
    got = [book.title for book in library.overdue(321)]
    if got != []:
        raise CheckFailed("On the day it's due, a book isn't overdue yet.", expected="[]", actual=repr(got))


TESTS = [custom("What's overdue", overdue_books, visible=True)]
