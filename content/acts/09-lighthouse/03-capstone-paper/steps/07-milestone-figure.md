---
id: main-figure
type: milestone
title: "Milestone 2: the main figure"
evidence: link
dialogue:
  - paul.neutral.point: "Log scales, both of them. Say so on the axes. Yahya will ask, and he'll be right to."
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
    why: "The checks were mine. Yours are the ones that know what your figure depends on."
---
1. Draw the median test error against the number of features, both axes on log scales (`plt.xscale("log")` and `plt.yscale("log")`), with a dashed line at 40, one feature per training example.
2. Add the training error, which falls to zero at the threshold, and the spread across seeds: each seed faintly, or the quartiles.
3. Change to ten new seeds and draw it again. If the shape survives, you have a result.
4. Add at least five tests of your own to `test_descent.py`.
5. Put `reproduce.py`, `descent.py`, your tests and the figure in a repository or a gist, and paste the link.

Done: running it twice draws the same figure, and every box below is ticked.
