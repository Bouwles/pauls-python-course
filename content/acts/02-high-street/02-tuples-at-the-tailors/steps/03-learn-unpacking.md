---
id: learn-unpacking
type: learn
title: Taking a tuple apart
concept: unpacking
code: |
  hale = (112, 98, 84)
  chest, waist, leg = hale
  print(leg)

  sizes = [(112, 98, 84), (96, 88, 74)]
  for chest, waist, leg in sizes:
      print(chest, leg)
---
**Unpacking** takes a tuple apart into separate names in one line. `chest, waist, leg = hale` puts the first value in `chest`, the second in `waist` and the third in `leg`.

Honest names beat `hale[2]`: anyone reading knows what `leg` holds without counting.

It works in a `for` loop too. Each tuple in the list is unpacked as it arrives, so the three names change on every pass. The example prints `84`, then `112 84` and `96 74`.

There must be exactly one name for each value. The usual slip is to expect spare values to be dropped. `chest, waist = hale` stops with a ValueError: too many values to unpack.
