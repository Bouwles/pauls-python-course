---
id: main-figure
type: milestone
title: "Milestone 2: the main figure"
evidence: link
dialogue:
  - neil: "Log scales, both of them. Say so on the axes. Aaesha will ask, and she'll be right to."
checklist:
  - id: figure
    text: "Your figure shows the median test error against the number of features, on log scales, with 40 features marked."
    why: "Without the log scales the peak flattens everything else. Without the mark, nobody knows why the peak is where it is."
  - id: training
    text: "Training error is shown too, in a second panel if you like, so a reader can see where it reaches zero."
    why: "The threshold is where training error hits zero. Show that, and the peak explains itself."
  - id: spread
    text: "The spread across seeds is shown as well as the median: each seed faintly, or the quartiles."
    why: "A median hides how wild the peak is. Show the wildness; it's half the result."
  - id: fixed-seeds
    text: "The seeds are fixed in the code, and running it twice draws the same figure."
    why: "If the figure changes every time you run it, which one did you reproduce?"
  - id: other-seeds
    text: "You've drawn it again with ten different seeds, and the shape survived."
    why: "One set of seeds is an anecdote. Two is the beginning of evidence."
  - id: labelled
    text: "Every axis says what it is, including the words 'log scale'."
    why: "A log axis read as a straight one makes a factor of a thousand look like a bump."
  - id: own-tests
    text: "test_descent.py has at least five tests of your own, and they pass when reproduce.py runs them."
    why: "The checks were Neil's. Yours are the ones that know what your figure depends on."
---
Draw the figure: median test error against the number of features, both axes on log scales, and a dashed line at 40, one feature per training example. Add the training error, which falls to zero at the threshold and stays there. Show the spread across the seeds, not only the median: the peak is wilder than any median can say.

Then change the seeds to ten new ones and draw it again. If the shape survives, you have a result. If it doesn't, you have a more interesting one.

Put `reproduce.py`, `descent.py`, your tests and the figure somewhere Neil can see them, a repository or a gist, and paste the link.
