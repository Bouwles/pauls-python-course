---
id: smoothing
type: worked
title: Smoothing out the crackle
code: |
  def smooth(readings, window=5):
      half = window // 2
      smoothed = []
      for i in range(len(readings)):
          nearby = readings[max(0, i - half): i + half + 1]
          smoothed.append(sum(nearby) / len(nearby))
      return smoothed


  dial = [0.1, 0.1, 1.7, 0.1, 0.1, 0.4, 0.8, 0.9, 0.8, 0.4]
  print([round(x, 2) for x in smooth(dial)])
subgoals:
  - label: How far each side to look
    lines: [1, 2]
  - label: Average each reading with its neighbours
    lines: [3, 6]
  - label: Try it on a crackle and a station
    lines: [9, 10]
explain:
  prompt: "After smoothing, the crackle at index 2 is about 0.42 and the station around index 7 is about 0.66. Why does smoothing shrink the crackle so much more than the station?"
  answer: "The crackle is one high reading among low ones, so averaging it with four quiet neighbours divides it by five. The station is high across several readings in a row, so its neighbours are high too and the average stays high."
---
A moving average replaces each reading with the mean of the readings around it. One loud reading among quiet ones gets watered down; a broad rise survives.

At the ends there aren't neighbours on both sides, so the slice is shorter: `max(0, i - half)` keeps the start from going negative, and slicing past the end just stops.
