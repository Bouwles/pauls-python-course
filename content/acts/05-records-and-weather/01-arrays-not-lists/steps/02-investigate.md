---
id: investigate
type: investigate
title: A whole class in one block
concept: vectorisation
code: |
  import time

  import numpy as np

  # One row per student: a number, the school, then three marks out of 20
  data = np.loadtxt("marks.csv", delimiter=",", skiprows=1, usecols=(0, 2, 3, 4))
  students = data[:, 0].astype(int)
  marks = data[:, 1:]

  print(marks.shape)
  print(students[3], marks[3, 2])
  print(marks.mean(axis=1)[:3])

  # The first student's marks as percentages, one mark at a time
  percent = []
  for mark in marks[0]:
      percent.append(mark / 20 * 100)
  print(len(percent))

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
    prompt: "Run it. What is `marks.shape`?"
    kind: answer
    accept: ["(395, 3)", "395, 3", "(395,3)", "395,3", "395 by 3", "395 x 3", "395x3"]
    feedback: "`(395, 3)`: 395 rows, one per student, and 3 columns, one per assessment. Two numbers, because the array has two axes."
    wrong: "It's the first line printed."
  - id: which-student
    prompt: "`marks[3, 2]` means row 3, column 2. The second line prints it beside `students[3]`. Which student's mark is it?"
    kind: answer
    accept: ["4", "student 4", "number 4", "the fourth", "the fourth student", "student four", "four"]
    feedback: "Student 4, and it's their final: 15. Rows count from 0, so row 3 is the fourth student, and column 2 is the third mark."
    wrong: "Look at the first number on the second line. Rows count from 0."
  - id: axis
    prompt: "`marks.mean(axis=1)` averages along each row: one average per student. What is the shape of `marks.mean(axis=0)`? Print it to find out."
    kind: answer
    accept: ["(3,)", "3", "(3)", "(3, )"]
    feedback: "`(3,)`: one average per assessment. `axis=0` collapses the rows, so all 395 students are averaged together. The axis you name is the one that disappears."
    wrong: "Add `print(marks.mean(axis=0).shape)` and run it."
  - id: zeros
    prompt: "Comparisons work on a whole array too. Add `print((marks[:, 2] == 0).sum())`. How many finals are 0?"
    kind: answer
    accept: ["38"]
    feedback: "38. `marks[:, 2] == 0` is 395 `True`s and `False`s, one per student, and `True` counts as 1 when you add them up. Remember the 38."
    wrong: "Copy the number the new line prints."
  - id: percent
    prompt: "Replace the loop with one line, so `percent` holds every mark in the class as a percentage: an array of 395 rows and 3 columns."
    kind: run
    tests: |
      def whole_class(ctx):
          import numpy as np
          module = ctx.module()
          percent = getattr(module, "percent", None)
          if not isinstance(percent, np.ndarray):
              raise CheckFailed("percent should be an array. Divide the whole of marks by 20 and multiply by 100, in one go.", actual=type(percent).__name__)
          if percent.shape != (395, 3):
              raise CheckFailed("percent should have one row per student and one column per mark.", expected="(395, 3)", actual=str(percent.shape))
          if not np.allclose(percent, module.marks / 20 * 100):
              raise CheckFailed("Each value should be the mark out of 20 as a percentage.")


      TESTS = [custom("The whole class as percentages", whole_class)]
    solution: |
      import time

      import numpy as np

      # One row per student: a number, the school, then three marks out of 20
      data = np.loadtxt("marks.csv", delimiter=",", skiprows=1, usecols=(0, 2, 3, 4))
      students = data[:, 0].astype(int)
      marks = data[:, 1:]

      print(marks.shape)
      print(students[3], marks[3, 2])
      print(marks.mean(axis=1)[:3])

      # The whole class as percentages, every mark at once
      percent = marks / 20 * 100
      print(len(percent))

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
`np.loadtxt` reads a file of numbers into one array. `usecols` picks the columns to read: the school's name is text, and an array holds one type, so it's left out. `data[:, 0]` means every row, column 0. `data[:, 1:]` is every row, from column 1 on.

An array has a **shape**: how many items lie along each **axis**. `marks` has two axes, rows and columns, and many array methods take `axis=` to say which way to work.

Run it, then answer the questions.
