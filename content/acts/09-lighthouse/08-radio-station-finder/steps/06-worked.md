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
Paul's `smooth`, the moving average from the Learn step, tried on a short dial with a crackle at index 2 and a station around index 7. Your `find_stations` starts by calling it.

The labels beside the code are Paul's steps.
