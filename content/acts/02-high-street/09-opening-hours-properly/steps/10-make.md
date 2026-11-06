---
id: make
type: make
title: Make the hours module
files: [hours.py, main.py]
entry: main.py
on_pass: { caitlin.pleased: "One copy, seven floors. And the Workshop closes at five again, not half past never." }
hints:
  nudge: "`when.weekday()` gives a number, with Monday as 0. How do you turn it into `Mon` or `Sat`, and what if that day isn't in the room's hours?"
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
Write `hours.py`. The board for the front door, `main.py`, is already written and imports it. Press **Run** to see the board:

```
Saturday 11:30 at the Clocktower
The Studio: open
The Makerspace: closed
The Workshop: open
```

and so on, as in the brief. Hours are whole hours on the 24-hour clock: a room with `(9, 17)` is open at 9:00 and closed at 17:00, so compare with `when.hour`. A day missing from the dictionary is closed. `busiest_day` gives back `None` for no visits, and the day seen first when days tie.

The comments in `hours.py` are the steps, Paul's from his sizes module among them. Run on its own, `hours.py` should print a quick check of itself. Imported, it should print nothing. The checks use their own dates, so today's date never matters.
