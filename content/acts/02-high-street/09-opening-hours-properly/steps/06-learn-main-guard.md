---
id: learn-main-guard
type: learn
title: Only when it's run itself
concept: main-guard
code: |
  def is_open(hour):
      return 9 <= hour < 17


  if __name__ == "__main__":
      print(is_open(10))
      print(is_open(17))
---
Every file gets a variable called `__name__` for free (say it "dunder name", for the double underscores). When you run the file itself, `__name__` is `"__main__"`. When another program imports it, `__name__` is the module's name, like `"hours"`.

So the lines under `if __name__ == "__main__":` run only when the file is run itself. That's the place for quick checks of your module. The board that imports `hours` gets the functions without the checks.

`9 <= hour < 17` asks two things at once: is `hour` at least 9, and less than 17? The example prints `True`, then `False`.

The usual slip is to think the guard hides the functions from importers. They're defined above it, so importers still get them.
