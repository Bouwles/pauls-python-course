def overdue_books(ctx):
    m = ctx.module()
    library = m.Library()
    collins = m.Book("Carrying the Fire", "Michael Collins", 1974)
    matchett = m.Book("The Mechanic's Tale", "Steve Matchett", 1999)
    fluent = m.Book("Fluent Python", "Luciano Ramalho", 2015)
    for book in (collins, matchett, fluent):
        library.add(book)
    collins.lend("Aaesha", today=300)
    matchett.lend("Riya", today=310)
    fluent.lend("Neil")
    fluent.give_back()
    if collins.due != 321:
        raise CheckFailed("A book lent on day 300 is due on day 321.", expected=321, actual=collins.due)
    if fluent.due is not None:
        raise CheckFailed("give_back clears the due day.", expected=None, actual=fluent.due)
    got = [book.title for book in library.overdue(325)]
    if got != ["Carrying the Fire"]:
        raise CheckFailed("On day 325, only Carrying the Fire is overdue.", expected="['Carrying the Fire']", actual=repr(got))
    got = [book.title for book in library.overdue(321)]
    if got != []:
        raise CheckFailed("On the day it's due, a book isn't overdue yet.", expected="[]", actual=repr(got))


TESTS = [custom("What's overdue", overdue_books, visible=True)]
