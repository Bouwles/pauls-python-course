---
id: learn-strings
type: learn
title: Text goes in quotes
concept: strings
code: |
  print("Neil's desk")
  print('Paul said "Run it"')
  print("Clock" + "tower")
---
A **string** is Python's word for a piece of text. It goes inside quotes: `"Ring the bell"`.

The quotes mark where the text starts and ends. Without them, Python would read the words as instructions. The quotes never print: only the text between them does.

Double quotes `"like this"` and single quotes `'like this'` both work, as long as both ends match. Choose the kind that isn't in your text. `Neil's desk` has an apostrophe, so line 1 puts double quotes outside. Single quotes would end the string after `Neil`, and Python would stop with an error: a message saying it couldn't read the line.

Line 3 shows one more thing: `+` joins two strings into one.
