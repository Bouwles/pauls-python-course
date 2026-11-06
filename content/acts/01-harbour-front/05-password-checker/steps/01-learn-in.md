---
id: learn-in
type: learn
title: Looking inside text
concept: in-operator
code: |
  password = "Clocktower1987"
  print("tower" in password)
  print("1987" in password)
  print("Tower" in password)
---
`in` asks whether one piece of text appears anywhere inside another. `"tower" in "Clocktower"` is `True`, and `"bell" in "Clocktower"` is `False`. Like a comparison, it always answers with a bool. It says whether, never where. `not in` asks the opposite question.

A password checker leans on it. Is the username inside the password? Is the word `password`?

Capitals count. To Python, `C` and `c` are different characters, so `"clock" in "Clocktower"` is `False`. The usual mistake is expecting `in` to match whatever the capitals. The next Learn step shows how to ignore them.
