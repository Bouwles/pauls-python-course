---
id: make
type: make
title: Make the label printer
files: [labels.py]
entry: labels.py
on_pass: { moss: "Ten wide, twenty-four wide, stars or dashes. And Tuesday's queue is Tuesday's." }
hints:
  nudge: "How does a function take any number of lines? And how does it take any number of named notes?"
  plan:
    - Say what it does, in a docstring
    - Make the border and cut each line to width
    - Join the border, the lines and the border with newlines
    - Start the tag with the line every label has, then add one line per note
    - Hand the tag's lines to label with a = border
    - Start a new list when no queue is given
  shape: |
    def label(*lines, border="-", width=24):
        """___"""
        edge = border * ___
        body = [line[___] for line in lines]
        return "\n".join([edge] + body + [edge])


    def tag(item, owner="Moss", **notes):
        """___"""
        lines = [f"{item.upper()} for {owner}"]
        for name, value in notes.___():
            lines.append(___)
        return label(*lines, border=___)


    def add_to_queue(text, waiting=None):
        """___"""
        if waiting is None:
            waiting = ___
        waiting.append(text)
        return waiting
---
Write the three functions from the brief in `labels.py`, each with a docstring. The comments are Moss's subgoals from the cake boxes.

Two things you haven't needed yet:

- `line[:24]` is the first 24 characters of `line`, or all of it if it's shorter.
- In a call, `label(*lines)` does the reverse of `*lines` in a `def`: it spreads a list out into separate arguments.

The checks call your functions with other borders, widths and notes, and call `add_to_queue` twice to see whether Tuesday gets Monday's labels.
