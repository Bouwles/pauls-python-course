---
id: review
type: reading
title: Moss's review
dialogue:
  - pip: "Moss is reviewing my stall code. He's been quiet for a long time."
  - moss: "Six things. None of them break it. All of them matter."
code: |
  from stalls import *
  def Book(m,d,n,t):
      try:
          m.book(d,n,t)
      except:
          print("error")
      x = m.takings(d) # takings
      return x
---
It runs. Moss's notes, from the top:

1. `import *` hides where `Market` came from. Name what you import.
2. `Book` looks like a class. Functions are `lower_case_with_underscores`; `CapWords` is for classes.
3. `m`, `d`, `n`, `t`, `x`: name each one for what it holds.
4. A bare `except:` swallows everything, Pip's typos included. Catch `BookingError`, and say what went wrong.
5. A space after each comma, two blank lines around top-level functions, lines under 80 characters.
6. `# takings` repeats the code. A comment should say why, not what.

```python
from stalls import BookingError, Market


def book_and_total(market, day, number, trader):
    try:
        market.book(day, number, trader)
    except BookingError as refusal:
        print(refusal)
    return market.takings(day)
```

Read your four files once more with those six in mind. Then ship it.
