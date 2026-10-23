---
id: investigate
type: investigate
title: A hundred years in one block
concept: vectorisation
code: |
  import time

  import numpy as np

  # One row per year: the year first, then twelve months of rain
  data = np.loadtxt("rainfall.csv", delimiter=",", skiprows=1)
  years = data[:, 0].astype(int)
  rain = data[:, 1:]

  print(rain.shape)
  print(years[0], rain[0, 9])
  print(rain.sum(axis=1)[:3])

  # The first year in inches, one month at a time
  inches = []
  for month in rain[0]:
      inches.append(month / 25.4)
  print(len(inches))

  # Adding up a million numbers, two ways
  numbers = list(range(1_000_000))
  start = time.perf_counter()
  total = 0
  for number in numbers:
      total = total + number
  loop_seconds = time.perf_counter() - start

  block = np.arange(1_000_000)
  start = time.perf_counter()
  total = block.sum()
  array_seconds = time.perf_counter() - start
  print(f"loop: {loop_seconds:.4f} s   array: {array_seconds:.4f} s")
tasks:
  - id: shape
    prompt: "Run it. What is `rain.shape`?"
    kind: answer
    accept: ["(100, 12)", "100, 12", "(100,12)", "100,12", "100 by 12", "100 x 12", "100x12"]
    feedback: "`(100, 12)`: 100 rows, one per year, and 12 columns, one per month. Two numbers, because the array has two axes."
    wrong: "It's the first line printed."
  - id: which-month
    prompt: "`rain[0, 9]` means row 0, column 9. Which month of which year is that?"
    kind: answer
    accept: ["October 1925", "Oct 1925", "1925 October", "October, 1925", "1925, October", "1925 Oct", "Oct, 1925"]
    feedback: "October 1925. Row 0 is the first year, and column 9 is the tenth month, because columns count from 0 too."
    wrong: "Rows are years, starting at 1925. Columns are months, starting at January. Both count from 0."
  - id: axis
    prompt: "`rain.sum(axis=1)` adds along each row. What is the shape of `rain.sum(axis=0)`? Print it to find out."
    kind: answer
    accept: ["(12,)", "12", "(12)", "(12, )"]
    feedback: "`(12,)`: one total per month. `axis=0` collapses the rows, so the hundred years are added together. The axis you name is the one that disappears."
    wrong: "Add `print(rain.sum(axis=0).shape)` and run it."
  - id: inches
    prompt: "Replace Penhallow's loop with one line, so `inches` holds the whole century in inches: an array of 100 rows and 12 columns. There are 25.4 millimetres in an inch."
    kind: run
    tests: |
      def whole_century(ctx):
          import numpy as np
          module = ctx.module()
          inches = getattr(module, "inches", None)
          if not isinstance(inches, np.ndarray):
              raise CheckFailed("inches should be an array. Divide the whole of rain by 25.4, in one go.", actual=type(inches).__name__)
          if inches.shape != (100, 12):
              raise CheckFailed("inches should have one row per year and one column per month.", expected="(100, 12)", actual=str(inches.shape))
          if not np.allclose(inches, module.rain / 25.4):
              raise CheckFailed("Each value should be the millimetres divided by 25.4.")


      TESTS = [custom("The whole century in inches", whole_century)]
    solution: |
      import time

      import numpy as np

      # One row per year: the year first, then twelve months of rain
      data = np.loadtxt("rainfall.csv", delimiter=",", skiprows=1)
      years = data[:, 0].astype(int)
      rain = data[:, 1:]

      print(rain.shape)
      print(years[0], rain[0, 9])
      print(rain.sum(axis=1)[:3])

      # The whole century in inches, every month at once
      inches = rain / 25.4
      print(len(inches))

      # Adding up a million numbers, two ways
      numbers = list(range(1_000_000))
      start = time.perf_counter()
      total = 0
      for number in numbers:
          total = total + number
      loop_seconds = time.perf_counter() - start

      block = np.arange(1_000_000)
      start = time.perf_counter()
      total = block.sum()
      array_seconds = time.perf_counter() - start
      print(f"loop: {loop_seconds:.4f} s   array: {array_seconds:.4f} s")
  - id: faster
    prompt: "Look at the last line. Which was faster: the loop or the array?"
    kind: answer
    accept: ["the array", "array", "arrays", "numpy", "the numpy array", "np", "block.sum()", "block", "the array one", "array sum", "the array sum", "block.sum"]
    feedback: "The array, usually by a factor of a hundred or more. The loop makes Python look at each number, check its type and make a new total, a million times over. The array's numbers share one type and sit side by side, so `sum()` runs as one piece of compiled code. Working on a whole array at once is called **vectorisation**."
    wrong: "Compare the two times. The smaller number won."
---
`np.loadtxt` reads a file of numbers into one array. `data[:, 0]` means every row, column 0. `data[:, 1:]` is every row, from column 1 onward.

An array has a **shape**: how many items lie along each **axis**. `rain` has two axes, rows and columns, and many array methods take `axis=` to say which way to work.

Run it, then answer the questions.
