---
id: learn-break
type: learn
title: Stop now
concept: break-continue
code: |
  while True:
      word = input("Password? ")
      if word == "open":
          break
      print("Wrong.")
  print("Come in.")
inputs: ["tea", "open"]
---
`break` leaves a loop straight away.

`while True:` is a loop whose test is always `True`, so it never stops by itself. That suits a game that can't know how many guesses it needs but knows exactly when to stop. Inside it, an `if` decides when, and `break` ends the loop.

Type `tea`, then `open`. It prints `Wrong.` for `tea`. For `open`, `break` skips the rest of that pass, so `Wrong.` doesn't print, and the program carries on after the loop with `Come in.`

The usual slip is to think `break` ends the whole program. It only leaves the loop. Everything after the loop still runs.
