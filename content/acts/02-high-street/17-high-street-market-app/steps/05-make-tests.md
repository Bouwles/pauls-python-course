---
id: make-tests
type: make
title: Your own tests
files: [stalls.py, storage.py, cli.py, test_market.py]
entry: test_market.py
starter_from: make-cli
dialogue:
  - moss: "Anyone can say it works. Tests say what would happen if it didn't."
on_pass: { moss: "Seven broken markets, seven caught. Those tests will outlast all of us." }
hints:
  nudge: "For each rule in the requirements, what would someone have to break for a test of yours to fail?"
  plan:
    - Make a fresh small_market() in every test
    - Write one test for each rule, the refusals and the things that should still work
    - "Use assert refused(lambda: ...) for the refusals"
    - Check free_stalls, bookings_on and takings by what they give back
    - Run the file and fix whatever fails
  shape: |
    def test_saturdays_only():
        market = small_market()
        assert refused(lambda: market.book(___, 1, "Bea"))


    def test_cancelling_frees_the_stall():
        market = small_market()
        market.book(SATURDAY, 3, "Bea")
        market.cancel(___)
        assert ___ in market.free_stalls(SATURDAY)
---
Last file. Write tests for the rules in `test_market.py`: plain functions whose names start with `test_`, each making a fresh `Market` and checking one thing with `assert`. Run the file to run them all.

There's no pytest on the workbench. `refused`, at the top of the file, checks that something raises `BookingError`.

The checks run your tests three ways: on your `stalls.py`, on Moss's, and on seven copies of Moss's that each break one rule. Your tests should pass on the first two and fail on every one of the seven.
