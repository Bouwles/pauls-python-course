def editor(ctx, limit=None):
    module = ctx.module()
    return module.Editor() if limit is None else module.Editor(limit)


def text_is(board, expected, what):
    if board.text != expected:
        raise CheckFailed(what, expected=repr(expected), actual=repr(board.text))


def typing(ctx):
    board = editor(ctx)
    board.type("Bolts 20p each")
    board.type(", nuts 10p")
    text_is(board, "Bolts 20p each, nuts 10p", "type adds words to the end of the text.")


def undo_and_redo(ctx):
    board = editor(ctx)
    board.type("Bolts 20p each")
    board.type(", nuts 10p")
    board.delete(10)
    text_is(board, "Bolts 20p each", "delete(10) takes the last ten characters off.")
    if board.undo() is not True:
        raise CheckFailed("undo should give back True when it takes an edit back.")
    text_is(board, "Bolts 20p each, nuts 10p", "Undoing a delete puts the characters back.")
    board.undo()
    text_is(board, "Bolts 20p each", "Undoing a type takes the words off again.")
    if board.redo() is not True:
        raise CheckFailed("redo should give back True when it does an edit again.")
    text_is(board, "Bolts 20p each, nuts 10p", "redo does the latest undone edit again.")
    board.redo()
    text_is(board, "Bolts 20p each", "A second redo does the delete again.")


def nothing_to_undo(ctx):
    board = editor(ctx)
    if board.undo() is not False or board.redo() is not False:
        raise CheckFailed("With no edits, undo and redo both give back False.")
    board.type("Hubcaps")
    board.undo()
    if board.undo() is not False:
        raise CheckFailed("Once every edit is undone, undo gives back False and changes nothing.")
    text_is(board, "", "Everything undone leaves an empty board.")


def new_edit_clears_redo(ctx):
    board = editor(ctx)
    board.type("Bolts 20p")
    board.type(" each")
    board.undo()
    board.type(", nuts 10p")
    if board.redo() is not False:
        raise CheckFailed("After a new edit, there's nothing to redo: the edit you undid belonged to a text that's gone.")
    text_is(board, "Bolts 20p, nuts 10p", "A redo after a new edit should change nothing.")


def deletes_past_the_start(ctx):
    board = editor(ctx)
    board.type("Nuts")
    board.delete(10)
    text_is(board, "", "Deleting more characters than there are deletes them all.")
    board.undo()
    text_is(board, "Nuts", "Undoing it puts back what was really deleted: all four.")


def empty_edits(ctx):
    board = editor(ctx)
    board.type("Bells")
    board.delete(0)
    board.type("")
    board.undo()
    text_is(board, "", "Deleting nothing and typing nothing aren't edits, so the one undo takes back Bells.")
    board.delete(3)
    if board.undo() is not False:
        raise CheckFailed("Deleting from an empty board deletes nothing, so there's nothing to undo.")


def short_memory(ctx):
    from collections import deque

    board = editor(ctx, 3)
    if not isinstance(board.undo_stack, deque) or board.undo_stack.maxlen != 3:
        raise CheckFailed("Editor(3) should keep its undo stack as deque(maxlen=3).", actual=repr(getattr(board, "undo_stack", None)))
    for word in ["a", "b", "c", "d", "e"]:
        board.type(word)
    undone = 0
    while board.undo():
        undone = undone + 1
    if undone != 3:
        raise CheckFailed("Editor(3) keeps only the latest three edits.", expected="3 undos", actual=f"{undone} undos")
    text_is(board, "ab", "With the latest three undone, the two oldest edits stay.")


def runs(line, expected, setup=()):
    def check(ctx):
        module = ctx.module()
        board = module.Editor()
        for words in setup:
            board.type(words)
        got = module.run(board, line)
        if got != expected:
            raise CheckFailed(f"run(editor, {line!r}) gives back the wrong lines.", expected=expected, actual=got)
    return check


def in_order(ctx):
    module = ctx.module()
    board = module.Editor()
    got = module.run(board, "type Bolts; type  20p; undo; show; redo; show")
    if got != ["Board: Bolts", "Board: Bolts 20p"]:
        raise CheckFailed("Commands on one line run in the order they were typed: first in, first out.",
                          expected=["Board: Bolts", "Board: Bolts 20p"], actual=got)


COMMANDS = "Commands: type <words>, delete <how many>, undo, redo, show, quit. Several at once: put ; between them."

SESSION = f"""{COMMANDS}
Board: Bolts 20p each, nuts 10p
Board: Bolts 20p each
Board: Bolts 20p each, nuts 10p
Nothing to redo.
Board: Bolts 20p each"""

TESTS = [
    custom("Typing, then undo and redo", undo_and_redo, visible=True,
           hint="Each edit goes on the undo stack as a pair: what kind it was, and the characters it typed or deleted."),
    output("A morning at the board", inputs=["type Bolts 20p each", "type , nuts 10p", "show", "delete 10; show", "undo; show", "redo; redo; show", "quit"],
           expect=SESSION, visible=True),
    custom("Typing adds to the end", typing),
    custom("Nothing to undo or redo", nothing_to_undo,
           hint="An empty stack has nothing to pop. Check first, and give back False."),
    custom("A new edit empties redo", new_edit_clears_redo,
           hint="Clear the redo stack on every new type or delete."),
    custom("Deleting more than there is", deletes_past_the_start,
           hint="Keep what was really deleted, not how many characters were asked for, so undo can put back exactly that."),
    custom("Edits that change nothing", empty_edits,
           hint="If nothing is typed or nothing is deleted, nothing goes on the undo stack."),
    custom("Only the latest edits are kept", short_memory,
           hint="deque(maxlen=limit) drops the oldest edit off the far end when a new one goes on."),
    custom("Several commands in one line", in_order,
           hint="Split the line on ; and put the commands in a deque. popleft takes the first one typed."),
    custom("Nothing to undo, said", runs("undo", ["Nothing to undo."])),
    custom("Nothing to redo, said", runs("redo", ["Nothing to redo."], setup=["Bells"])),
    custom("Delete how many", runs("delete lots", ["Delete how many?"]),
           hint="delete needs a whole number after it. Anything else gets Delete how many? and changes nothing."),
    custom("A command it doesn't know", runs("rub it out", [COMMANDS])),
    custom("A blank line", runs("", [])),
]
