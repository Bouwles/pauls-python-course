---
id: investigate
type: investigate
title: The night the glass fell
concept: derivatives
dialogue:
  - paul: "The Clocktower's barograph, the night of the great storm in 1987. The glass fell all evening."
  - aaesha: "How low it went is the headline. How fast it fell is the warning."
code: |
  import numpy as np

  # The Clocktower's barograph from noon on 15 October 1987: hours since noon, pressure in hPa
  readings = np.loadtxt("barometer.csv", delimiter=",", skiprows=1)
  hours = readings[:, 0]
  pressure = readings[:, 1]
  print(pressure.min(), hours[pressure.argmin()])

  # How fast it changed: the change in pressure over the change in time, an hour either side
  rate = (pressure[2:] - pressure[:-2]) / (hours[2:] - hours[:-2])
  print(len(pressure), len(rate))
  print(rate.round(1))
  print(rate.min().round(1), hours[1:-1][rate.argmin()])
tasks:
  - id: units
    prompt: "Run it. `rate` is a change in pressure divided by a change in time. What are its units?"
    kind: answer
    accept: ["hPa per hour", "hPa/hour", "hPa an hour", "hPa/h", "hPa per hr", "hectopascals per hour", "hpa per hour", "hpa/h"]
    feedback: "Hectopascals per hour. A rate always has two units: what changed, per what it changed with."
    wrong: "The top line is in hPa, divided by something measured in hours."
  - id: fastest
    prompt: "How many hours after noon was the glass falling fastest?"
    kind: answer
    accept: ["9", "nine", "9 hours", "hour 9", "9pm", "9 pm"]
    feedback: "Nine: nine in the evening, falling 6.1 hPa an hour. The lowest pressure didn't come until four hours later."
    wrong: "It's the last line: the fastest fall is the most negative rate, then the hour it happened."
  - id: lowest
    prompt: "The lowest pressure came at hour 13. Find hour 13's rate in the list. What is the rate close to, at the very bottom?"
    kind: answer
    accept: ["0", "zero", "nothing", "about 0", "close to 0", "almost 0", "-0.5", "nearly 0", "about zero"]
    feedback: "Close to 0. At the bottom of a dip the pressure has stopped falling and not yet started rising: the slope is flat. The fall before it is negative, the rise after it positive."
    wrong: "`rate` starts at hour 1, so hour 13 is the thirteenth number in the list."
  - id: warning
    prompt: "Aaesha's warning goes up when the glass falls faster than 3 hPa an hour. Add `warning_hours`: the hours, from `hours[1:-1]`, when `rate` was below -3."
    kind: run
    tests: |
      def warning(ctx):
          import numpy as np

          got = getattr(ctx.module(), "warning_hours", None)
          if got is None:
              raise CheckFailed("There should be a variable called warning_hours.")
          if not np.array_equal(np.asarray(got, dtype=float), np.arange(6.0, 13.0)):
              raise CheckFailed("warning_hours should hold every hour when the rate was below -3.",
                                expected="[ 6.  7.  8.  9. 10. 11. 12.]", actual=str(np.asarray(got)))


      TESTS = [custom("The warning hours", warning)]
    solution: |
      import numpy as np

      # The Clocktower's barograph from noon on 15 October 1987: hours since noon, pressure in hPa
      readings = np.loadtxt("barometer.csv", delimiter=",", skiprows=1)
      hours = readings[:, 0]
      pressure = readings[:, 1]
      print(pressure.min(), hours[pressure.argmin()])

      # How fast it changed: the change in pressure over the change in time, an hour either side
      rate = (pressure[2:] - pressure[:-2]) / (hours[2:] - hours[:-2])
      print(len(pressure), len(rate))
      print(rate.round(1))
      print(rate.min().round(1), hours[1:-1][rate.argmin()])
      warning_hours = hours[1:-1][rate < -3]
      print(warning_hours)
---
A **derivative** is a rate: how fast one thing changes as another moves. On a graph of pressure against time it's the slope of the line. Downhill is negative, uphill positive, flat is 0.

From readings, you measure it. `pressure[2:] - pressure[:-2]` takes each reading from the one two hours later, all at once: rise over run, an hour either side of each hour. The first and last hours have no neighbour on one side, so they get no rate, and `hours[1:-1]` are the hours that do.

Run it, then answer the questions.
