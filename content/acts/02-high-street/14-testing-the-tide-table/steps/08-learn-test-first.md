---
id: learn-test-first
type: learn
title: Tests before code
concept: test-first
code: |
  def booking_fee(pence):
      raise NotImplementedError("Tests first. Then this.")


  def test_small_bookings_are_free():
      assert booking_fee(500) == 0


  try:
      test_small_bookings_are_free()
      print("passed")
  except NotImplementedError:
      print("failed: booking_fee isn't written yet")
---
**Test-first** means writing a feature's tests before the feature. You decide exactly what it should do, edges included, while nothing yet exists to argue with.

Then run the tests and watch them fail. A test you've seen fail is a test you know can fail. One that has only ever passed might be checking nothing at all.

Then write the simplest code that makes them pass, and keep the tests for every change after. `raise NotImplementedError(...)` is Python's way of saying "not written yet". The example prints `failed: booking_fee isn't written yet`.

Aaesha's last two requirements, `transfer` and `add_interest`, are built this way.

The usual slip is to think a test that fails before the code exists is broken. That's the test working.
