---
id: learn-widths
type: learn
title: Lining numbers up
concept: f-strings
code: |
  print(f"[{7:3}]")
  print(f"[{42:3}]")
  print(f"[{144:3}]")
  print(f"[{1225:3}]")
---
In an f-string, a colon and a number after the value, like `{n:3}`, sets a **width**: the least number of characters the value takes up. Spaces fill the rest, in front, so numbers line up by their last digit.

On the right, the square brackets show where each value starts and ends. `7` gets two spaces in front, `42` gets one, and `144` fills the width exactly.

That's how a times table gets straight columns. Give every number the same width, and the `x` and `=` signs line up under each other.

The width is a minimum, not a limit. The usual surprise: a number that's too wide, like `1225`, isn't cut short. It takes the room it needs.
