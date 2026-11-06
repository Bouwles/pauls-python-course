---
id: learn-defaults
type: learn
title: A value to fall back on
concept: default-arguments
code: |
  def welcome(name, greeting="Morning"):
      return f"{greeting}, {name}."

  print(welcome("Riya"))
  print(welcome("Neil", "Evening"))
---
A **default argument** is a value a parameter falls back on when the call leaves it out. You write it in the `def` line with `=`: `greeting="Morning"`.

Defaults make the usual case easy and still allow a change. Caitlin wants passwords 12 characters long unless someone asks for another length.

`welcome("Riya")` gives no greeting, so `greeting` is `"Morning"`. `welcome("Neil", "Evening")` gives one, so the default is ignored. The example prints `Morning, Riya.`, then `Evening, Neil.`

Parameters with defaults go after the ones without, or Python stops with a SyntaxError.

The usual slip is to think a left-out argument becomes `None`. It gets the default written in the `def` line.
