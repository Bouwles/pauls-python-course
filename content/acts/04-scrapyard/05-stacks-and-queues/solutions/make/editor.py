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
        if not words:
            return
        self.text = self.text + words
        self.undo_stack.append(("type", words))
        self.redo_stack.clear()

    def delete(self, count):
        """Delete the last count characters, or all of them if there are fewer."""
        removed = self.text[max(len(self.text) - count, 0):] if count > 0 else ""
        if not removed:
            return
        self.text = self.text[:len(self.text) - len(removed)]
        self.undo_stack.append(("delete", removed))
        self.redo_stack.clear()

    def undo(self):
        """Take back the latest edit still standing. False if there's nothing to take back."""
        if not self.undo_stack:
            return False
        kind, words = self.undo_stack.pop()
        if kind == "type":
            self.text = self.text[:len(self.text) - len(words)]
        else:
            self.text = self.text + words
        self.redo_stack.append((kind, words))
        return True

    def redo(self):
        """Do again the latest edit undone. False if there's nothing to do again."""
        if not self.redo_stack:
            return False
        kind, words = self.redo_stack.pop()
        if kind == "type":
            self.text = self.text + words
        else:
            self.text = self.text[:len(self.text) - len(words)]
        self.undo_stack.append((kind, words))
        return True


def run(editor, line):
    """Carry out one line of commands, in the order they were typed. Returns what to print."""
    printed = []
    waiting = deque(command.strip() for command in line.split(";"))
    while waiting:
        command = waiting.popleft()
        word, _, rest = command.partition(" ")
        if word == "type":
            editor.type(rest)
        elif word == "delete":
            if rest.strip().isdigit():
                editor.delete(int(rest))
            else:
                printed.append("Delete how many?")
        elif word == "undo":
            if not editor.undo():
                printed.append("Nothing to undo.")
        elif word == "redo":
            if not editor.redo():
                printed.append("Nothing to redo.")
        elif word == "show":
            printed.append(f"Board: {editor.text}")
        elif word:
            printed.append(COMMANDS)
    return printed


if __name__ == "__main__":
    board = Editor()
    print(COMMANDS)
    while True:
        line = input("Edit? ").strip()
        if line == "quit":
            break
        for answer in run(board, line):
            print(answer)
