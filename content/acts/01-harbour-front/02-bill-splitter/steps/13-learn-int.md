---
id: learn-int
type: learn
title: Text to a whole number
concept: int-conversion
code: |
  people = input("People? ")
  people = int(people)
  print(people * 2)
inputs: ["6"]
---
`int()` turns a string of digits into a whole number, an int. `int("6")` is the number 6, so you can do sums with it.

The program on the right asks for the text on line 1, then turns it into a number on line 2. `people = int(people)` works out `int(people)` first, then moves the label `people` onto the number. Type `6` and it prints `12`.

The usual mistake is giving `int()` text with a decimal point. `int("2.5")` doesn't round or guess: it stops with a **ValueError**, the error for a value Python can't use. And given a float, `int(7.9)` chops off the decimals and gives `7`. It never rounds.
