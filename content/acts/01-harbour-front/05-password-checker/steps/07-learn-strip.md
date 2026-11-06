---
id: learn-strip
type: learn
title: Tidying text
concept: strip-replace
code: |
  username = "  Yahya "
  print(username.strip() + "|")
  print("passw0rd".replace("0", "o"))
  print("  Yahya ".strip().lower())
---
People type spaces before and after things without noticing. `.strip()` hands back a copy with the spaces taken off both ends: `"  Yahya ".strip()` is `"Yahya"`. It never touches spaces in the middle. Give it characters, as in `.strip(".!")`, and it takes those off the ends instead. On the right, line 2 adds a `|` so you can see where the stripped text ends.

`.replace(old, new)` hands back a copy with every `old` swapped for `new`: `"passw0rd".replace("0", "o")` is `"password"`. Every match, not just the first.

You can call one method straight after another. `"  Yahya ".strip().lower()` strips first, then lowers the stripped copy: `"yahya"`.

The usual mistake is expecting `.strip()` to take out every space, including the ones between words.
