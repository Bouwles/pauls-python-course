---
id: data-kept
type: milestone
title: "Milestone 2: the data, kept"
evidence: link
dialogue:
  - caitlin.worried: "The marina switches everything off at six. The boats stay booked overnight. So must the bookings."
checklist:
  - id: choice
    text: "You've chosen a JSON file or SQLite, and written one sentence on why."
    why: "Either will carry five berths for a century. Not knowing why you chose one is the problem."
  - id: restart
    text: "Bookings survive a restart: stop the server, start it, and they're all still there."
    why: "Requirement four. The marina will test it the first evening, by accident."
  - id: one-module
    text: "Only one module reads and writes the data, and the routes call it."
    why: "When the storage changes, you change one module, not every route that ever touched a file."
  - id: clash
    text: "Two boats can't be booked into one berth on the same night, and the agreed clash tests pass."
    why: "Requirement three is the one that ends with two hulls and one pontoon."
  - id: numbers
    text: "Booking numbers aren't reused, even after the last booking is cancelled and the server restarted."
    why: "A number on a receipt has to mean one booking for ever. SQLite reuses them unless you tell it not to."
  - id: first-run
    text: "With no data file yet, the app starts with no bookings instead of crashing."
    why: "The first run on the marina's computer is the one that matters most, and it has no file."
  - id: own-tests
    text: "At least three of your own tests in tests/test_mine.py check the data, and pass."
    why: "You know where your storage is weakest. Write the test there."
---
Bookings have to outlive the server. Two good choices, both already in Python:

A **JSON file**: read the whole file, change it, write it back. `json.load` and `json.dump` do the work. Simple, readable by eye, and fine for five berths. Write to a new file and swap it in with `os.replace`, so a crash halfway can't leave half a file.

**SQLite**: a real database in one file, with `sqlite3.connect(path)`. You write SQL; it handles the rest, including two requests at once. Declare the id `INTEGER PRIMARY KEY AUTOINCREMENT`, or it will reuse numbers.

Whichever you choose, `create_app(data_file)` gets the path, so each test has its own. Caitlin's link: wherever your repository lives.
