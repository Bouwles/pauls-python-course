---
id: learn-forecast
type: learn
title: Running on its own
concept: rnns
code: |
  readings = [4.0, 3.2, 2.0]            # heights so far


  def next_hour(height):
      return 0.5 + 0.8 * height         # a made-up rule for the next reading


  guess = next_hour(readings[-1])
  ahead = [guess]
  for hour in range(3):
      guess = next_hour(guess)          # no reading any more: the guess goes back in
      ahead.append(guess)
  print([round(g, 2) for g in ahead])
---
Once the readings run out, the network can keep going on its own. Its last guess is the best idea it has of the next reading, so feed the guess back in as if it were one, and guess again. Each guess becomes the next hour's reading.

The example does it with a made-up rule instead of a network. After the last real height, 2.0, it guesses 2.1, then feeds 2.1 back in, and so on for four hours.

It's how a forecast looks several hours ahead. But every guess is built on the guesses before it, so small errors pile up, and the sixth hour is shakier than the first.

The usual mistake is expecting a forecast many steps ahead to be as good as one step ahead.
