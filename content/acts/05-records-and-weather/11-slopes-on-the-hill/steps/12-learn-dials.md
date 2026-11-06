---
id: learn-dials
type: learn
title: Which way to turn the dials
concept: chain-rule
dialogue:
  - yahya.worried: "The new thermometer reads low. Two dials on the back. Which way do I turn them?"
code: |
  gain, offset = 1.0, 0.0
  reading, true = 9.0, 10.0
  miss = gain * reading + offset - true
  print(2 * miss * reading, 2 * miss)
---
A model has settings to adjust. The Archive's new thermometer's corrected reading is `gain * reading + offset`: two dials. How wrong it is, its **miss**, is `gain * reading + offset - true`. Machine learning squares the miss, so both ways of being wrong count.

The chain rule gives the slope of the squared miss for each dial. The outer slope, squaring, is `2 * miss`. The miss changes by `reading` for each 1 the gain turns, and by 1 for each 1 the offset turns. So the gain's slope is `2 * miss * reading`, and the offset's is `2 * miss`.

A negative slope means turning that dial up makes the miss smaller. The example prints `-18.0 -2.0`: turn both up.

The usual slip is to turn a dial the way its slope points. That's uphill: more wrong.
