---
id: where-it-came-from
type: learn
title: Where the numbers came from
concept: data-provenance
code: |
  with open("stornowaydata.txt") as station_file:
      lines = station_file.read().splitlines()

  for line in lines[:5]:          # the notes above the table
      print(line[:60])
  print(lines[1569].split())      # September 2003: rain estimated, sunshine from the sensor
dialogue:
  - yahya.thinking.point: "Before the numbers, the notes above them. Somebody wrote those for a reason."
---
A data file's notes are part of its data. `stornowaydata.txt` starts with five lines about the station and its marks, then two of column names and units, then one row per month.

Four marks change what a number means. `*`: estimated from nearby stations, not measured here. `---`: missing. `#`: sunshine from the automatic sensor; before September 2002, a glass ball burnt a line on a card. `Provisional`: not yet fully checked. The example prints the notes, then September 2003, with `111.1*` and `83.7#`.

Strip the marks and forget them, and an estimate looks like a measurement. So keep each as a True or False column beside the numbers.

A dataset's **provenance** is where it came from and what happened to it on the way: who measured it, how, when it was downloaded, under what licence. `SOURCE.md` is this one's.
