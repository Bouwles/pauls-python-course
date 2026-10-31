---
id: make
type: make
title: Make the text editor
files: [editor.py]
entry: editor.py
on_pass: { paul: "Wrote it, rubbed it out, put it back. And not a speck of chalk on my sleeve." }
hints:
  nudge: "What does undo need to know about an edit to take it back: just what kind it was, or the characters too? And which edits go on the redo stack?"
  plan:
    - "type: nothing typed, no edit; otherwise add the words, push the edit, clear redo"
    - "delete: work out what's really deleted first; nothing, no edit; otherwise cut it, push the edit, clear redo"
    - "undo: nothing on the stack? False. Otherwise pop the latest, take it back, push it onto redo"
    - "redo: the same, the other way round"
    - "run: split the line on ;, queue the commands in a deque, and popleft each in turn"
  shape: |
    def undo(self):
        if not self.undo_stack:
            return ___
        kind, words = self.undo_stack.___()
        if kind == "type":
            self.text = self.text[:len(self.text) - ___]
        else:
            self.text = ___
        self.redo_stack.append(___)
        return True


    def run(editor, line):
        printed = []
        waiting = deque(command.strip() for command in line.split(___))
        while waiting:
            command = waiting.___()
            word, _, rest = command.partition(" ")
            ...
        return printed
---
Write the `Editor` methods and `run` in `editor.py`. `__init__` and the loop at the bottom are written.

```
Edit? type , queues 2
Edit? delete 10; show
Board: Stacks at 10
Edit? undo; show
Board: Stacks at 10, queues 2
Edit? redo; redo; show
Nothing to redo.
Board: Stacks at 10
```

Each edit goes on the undo stack as a pair: `("type", words)` or `("delete", removed)`, the characters really removed. Undo pops the pair and does the opposite, then puts it on the redo stack. The undo stack is `deque(maxlen=limit)`: the oldest edit drops off the far end, so it never grows past the limit.

`command.partition(" ")` splits off the first word: `("type", " ", "Stacks at 10")`.

The hidden checks undo with nothing to undo, delete past the start, and type nothing at all.
