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
Bookings have to outlive the server.

1. Choose a JSON file or SQLite, and write one sentence on why.
2. Write one module that reads and writes the data, and have the routes call it. `create_app(data_file)` is handed the path, so each test has a file of its own.
3. Finish the booking routes, the clash check included.
4. Write at least three tests of your own for the data.

Done: stop the server, start it again, and every booking is still there; no booking number is ever given out twice; and every box below is ticked. The link is wherever your repository lives.
