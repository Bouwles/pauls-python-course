---
id: make
type: make
title: Make the hours module
files: [hours.py, main.py]
entry: main.py
on_pass: { sanjay: "One copy, seven shops. Mrs Vance says the library's hours are finally the library's hours." }
hints:
  nudge: "`when.weekday()` gives a number, with Monday as 0. How do you turn it into `Mon` or `Sat`, and what if that day isn't in the shop's hours?"
  plan:
    - Say what the module is for
    - Turn when.weekday() into a day name with DAYS
    - "No hours for that day: closed"
    - Open from the opening hour, closed from the closing hour
    - Count the day names with Counter, and take the most common
    - Quick checks under the main guard
  shape: |
    from collections import Counter

    DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


    def is_open(hours, when):
        times = hours.get(DAYS[___])
        if times is None:
            return False
        opens, closes = times
        return opens <= ___ < closes


    def sign(hours):
        lines = []
        for day in DAYS:
            ...
        return lines


    def busiest_day(visits):
        if len(visits) == 0:
            return None
        counts = Counter([DAYS[visit.weekday()] for visit in visits])
        return counts.___(1)[0][0]


    if __name__ == ___:
        ...
---
Write `hours.py`. The traders' board, `main.py`, is already written and imports it. Press **Run** to see the board:

```
Saturday 11:30 on the High Street
Sanjay's: open
Okonjo's: closed
The Library: open
```

and so on, as in the brief. Hours are whole hours on the 24-hour clock: a shop with `(9, 17)` is open at 9:00 and closed at 17:00. A day missing from the dictionary is closed. `busiest_day` gives back `None` for no visits, and the day seen first when days tie.

Run on its own, `hours.py` should print a quick check of itself. Imported, it should print nothing. The checks pass in their own dates, so today's date never matters.
