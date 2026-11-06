---
id: learn-windows
type: learn
title: A window of characters before
concept: language-models
code: |
  NEWLINE = "\n"
  note = "ok"
  context = 2

  padded = NEWLINE * context + note + NEWLINE      # newlines in front, one at the end
  for end in range(context, len(padded)):
      window, target = padded[end - context:end], padded[end]
      print(repr(window), "->", repr(target))
---
The bigram guessed from one character back. The reader guesses from four. So the notes are cut into **windows**: each character, with the four characters before it as the window, and the character itself as the target to guess.

At the start of a note there aren't four characters before it yet. So the window is padded with newlines, the character that ends every note, and one more newline goes on the end. The model then learns how notes begin, and when to stop.

The example does it with a window of 2 on the note `ok`: three windows, the last one guessing the newline that ends the note.

The usual mistake is running windows across the end of one note into the next. Each note is cut on its own.
