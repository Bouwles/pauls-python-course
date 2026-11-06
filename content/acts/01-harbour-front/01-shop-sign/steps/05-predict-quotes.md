---
id: predict-quotes
type: predict
title: Which quote ends it?
concept: strings
code: |
  print('Riya's sketchbook')
question: What happens when this runs?
verify: error
options:
  - text: "Riya's sketchbook"
    misconception: mismatched-quotes-ok
    feedback: "The string starts at the first `'`, and the next `'` is the apostrophe, so Python thinks the string ends after `Riya`. The rest of the line makes no sense to it."
  - text: "'Riya's sketchbook'"
    misconception: quotes-printed
    feedback: "Quotes never print, even on a line that works. And this line doesn't work: the apostrophe ends the string after `Riya`."
  - text: "An error: Python can't read the line, so nothing prints"
    correct: true
    error: SyntaxError
    feedback: "Right. The apostrophe ends the string after `Riya`. This kind of error is a SyntaxError: Python couldn't read the code. Double quotes outside fix it: `print(\"Riya's sketchbook\")`."
---
The text `Riya's sketchbook` has an apostrophe in it, and this line puts single quotes around the outside.