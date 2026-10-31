---
id: investigate
type: investigate
title: The January vane
concept: vectors
dialogue:
  - aaesha: "The old summary says January blew from the south. The vane spent the month pointing north."
code: |
  import numpy as np

  # The old January summary: one bearing a day, then the average
  data = np.loadtxt("vane.csv", delimiter=",", skiprows=1, usecols=(1, 2))
  bearings = data[:, 0]
  speeds = data[:, 1]
  print(f"Average bearing: {bearings.mean():.0f} degrees")

  # Aaesha's way: each day as an arrow, (east, north) in knots,
  # pointing where the wind came from, as the vane does
  angles = np.radians(bearings)
  arrows = np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])
  print(arrows[:3].round(1))
  print(arrows.shape)

  mean_arrow = arrows.mean(axis=0)
  print(mean_arrow.round(2))
  print(np.linalg.norm(mean_arrow).round(1), speeds.mean().round(1))
tasks:
  - id: average-bearing
    prompt: "Run it. What average bearing does the old summary give, to the nearest degree?"
    kind: answer
    accept: ["197", "197 degrees", "197°"]
    feedback: "197 degrees: just west of south. Not one day in January had a southerly. Northerlies sit either just above 0 or just below 360, and the average of 10 and 350 lands in the middle: 180."
    wrong: "It's the first line printed."
  - id: shape
    prompt: "What is the shape of `arrows`?"
    kind: answer
    accept: ["(31, 2)", "31, 2", "(31,2)", "31,2", "31 by 2", "31 x 2"]
    feedback: "31 rows, one arrow a day, and 2 columns: east, then north."
    wrong: "It's the line after the first three arrows."
  - id: which-way
    prompt: "`mean_arrow` is the average of the 31 arrows: (east, north). Which way does it point: north, east, south or west?"
    kind: answer
    accept: ["north", "n", "northerly", "from the north", "north, a bit west", "north-west", "nnw", "north by west"]
    feedback: "North, and a touch west. Arrows don't wrap round at 360 the way bearings do, so averaging them can't be fooled."
    wrong: "The mean arrow is the fourth line: a small east part and a large north part. Which is bigger, and is it above or below 0?"
  - id: bearing-back
    prompt: "Turn the mean arrow back into a bearing. Add `bearing = np.degrees(np.arctan2(mean_arrow[0], mean_arrow[1])) % 360` at the end, and print it."
    kind: run
    tests: |
      def back_to_a_bearing(ctx):
          bearing = getattr(ctx.module(), "bearing", None)
          if bearing is None:
              raise CheckFailed("There should be a variable called bearing.")
          if abs(float(bearing) - 350.124) > 0.01:
              raise CheckFailed("bearing should be the compass bearing of mean_arrow.", expected="about 350.1", actual=repr(bearing))


      TESTS = [custom("The bearing of the mean arrow", back_to_a_bearing)]
    solution: |
      import numpy as np

      # The old January summary: one bearing a day, then the average
      data = np.loadtxt("vane.csv", delimiter=",", skiprows=1, usecols=(1, 2))
      bearings = data[:, 0]
      speeds = data[:, 1]
      print(f"Average bearing: {bearings.mean():.0f} degrees")

      # Aaesha's way: each day as an arrow, (east, north) in knots,
      # pointing where the wind came from, as the vane does
      angles = np.radians(bearings)
      arrows = np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])
      print(arrows[:3].round(1))
      print(arrows.shape)

      mean_arrow = arrows.mean(axis=0)
      print(mean_arrow.round(2))
      print(np.linalg.norm(mean_arrow).round(1), speeds.mean().round(1))
      bearing = np.degrees(np.arctan2(mean_arrow[0], mean_arrow[1])) % 360
      print(bearing)
  - id: shorter
    prompt: "The last line prints the mean arrow's length, 11.4, beside the average speed, 14.1. Which way would the wind have to blow, all month, for the two to be equal?"
    kind: answer
    accept: ["the same way", "always the same way", "one direction", "the same direction", "always the same direction", "from one direction", "the same way every day", "same direction", "same way", "from the same direction"]
    feedback: "The same way every day. Arrows that point different ways partly cancel when they're added, so the average arrow comes out shorter than the average speed. How much shorter says how changeable the month was."
    wrong: "Arrows pointing opposite ways cancel when you add them. When would nothing cancel at all?"
---
A **vector** is a few numbers that belong together, in a fixed order. Aaesha draws each day's wind as an arrow: knots east, then knots north. In NumPy that's an array, `np.array([3.0, 4.0])`, and a table of arrows has one per row.

`np.radians` turns degrees into the radians that `np.sin` and `np.cos` expect. `np.linalg.norm(arrow)` is an arrow's length: Pythagoras, `np.sqrt(3 ** 2 + 4 ** 2)`.

`np.arctan2(east, north)` goes the other way, from an arrow to its angle. Bearings are measured from north towards east, so east goes first.

Run it, then answer the questions.
