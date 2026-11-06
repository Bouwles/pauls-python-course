"""Undo/Redo Text Editor: the Workshop's chalkboard, tried out before it's chalked."""
from collections import deque

COMMANDS = "Commands: type <words>, delete <how many>, undo, redo, show, quit. Several at once: put ; between them."


class Editor:
    """A line of text, with every edit kept so it can be undone and redone."""

    def __init__(self, limit=20):
        self.text = ""
        self.undo_stack = deque(maxlen=limit)  # latest edit on the right; the oldest falls off the left
        self.redo_stack = []                   # latest undo on top

    def type(self, words):
        """Add words to the end of the text."""
        # A change: nothing to change, no edit
        # Make the change, push it, clear redo

    def delete(self, count):
        """Delete the last count characters, or all of them if there are fewer."""
        # A change: nothing to change, no edit
        # Make the change, push it, clear redo

    def undo(self):
        """Take back the latest edit still standing. False if there's nothing to take back."""
        # Undo: nothing on the stack? False
        # Pop the latest, take it back, push it onto redo

    def redo(self):
        """Do again the latest edit undone. False if there's nothing to do again."""
        # Redo: the same, the other way round


def run(editor, line):
    """Carry out one line of commands, in the order they were typed. Returns what to print."""
    # Split the line on ;, and queue the commands
    # Take each from the front, in turn


if __name__ == "__main__":
    board = Editor()
    print(COMMANDS)
    while True:
        line = input("Edit? ").strip()
        if line == "quit":
            break
        for answer in run(board, line):
            print(answer)
