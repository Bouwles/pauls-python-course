---
id: review
type: reading
title: Paul's review
dialogue:
  - caitlin: "Paul is reviewing my money code. He's been quiet for a long time."
  - paul: "Six things. None of them break it. All of them matter."
code: |
  from money import *
  def Spend(l,d,p,c):
      try:
          l.add(d,-p,c)
      except:
          print("error")
      x = l.balance() # balance
      return x
---
It runs. Paul's notes, from the top:

1. `import *` hides where `Ledger` came from. Name what you import.
2. `Spend` looks like a class. Functions are `lower_case_with_underscores`; `CapWords` is for classes.
3. `l`, `d`, `p`, `c`, `x`: name each one for what it holds. `l` looks like `1` in half the fonts in the Workshop.
4. A bare `except:` swallows everything, typos included. Catch `MoneyError`, and say what went wrong.
5. A space after each comma, two blank lines around top-level functions, lines under 80 characters.
6. `# balance` repeats the code. A comment should say why, not what.

```python
from money import MoneyError


def spend_and_balance(ledger, day, pence, category):
    try:
        ledger.add(day, -pence, category)
    except MoneyError as refusal:
        print(refusal)
    return ledger.balance()
```

Read your four files once more with those six in mind. Then take it home.
