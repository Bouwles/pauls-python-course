---
id: investigate
type: investigate
title: Read it before you touch it
concept: exceptions
dialogue:
  - paul.neutral.point: "Neil's script, as he left it. Read it top to bottom before you run anything."
code: |
  # Flight log report, for Neil's drone.
  # Reads flight.log and counts the errors from each system on the drone.
  #
  # Every system writes one line each time:  time | level | system | message
  # If one ever stops doing that, this report stops too, and says which line.
  # Better a loud stop than a quiet wrong answer. N.

  LOG_FILE = "flight.log"

  # Every level a system is allowed to use. Anything else is a system
  # making things up, which the camera does in the cold.
  LEVELS = ("INFO", "WARN", "ERROR")


  def parse_line(line, number):
      """Split one log line into (time, level, system, message)."""
      # At most 3 splits: the camera puts | in its messages. I asked it not to.
      parts = line.split("|", 3)
      if len(parts) != 4:
          # Always say which line. Nobody finds line 4,012 by looking.
          raise ValueError(f"line {number}: expected 4 parts, got {len(parts)}")
      time, level, system, message = parts
      level = level.strip()
      if level not in LEVELS:
          raise ValueError(f"line {number}: unknown level {level}")
      return time.strip(), level, system.strip(), message.strip()


  def read_log(path):
      """Read every line of the log. Returns a list of parsed entries."""
      entries = []
      with open(path) as log:
          # Lines are counted from 1, because people count from 1.
          for number, line in enumerate(log, start=1):
              entries.append(parse_line(line, number))
      return entries


  def count_errors(entries):
      """Count the ERROR entries for each system. Returns a dict."""
      counts = {}
      for time, level, system, message in entries:
          if level == "ERROR":
              counts[system] = counts.get(system, 0) + 1
      return counts


  entries = read_log(LOG_FILE)
  counts = count_errors(entries)

  print(f"{len(entries)} entries read")
  print("Errors by system:")
  for system, count in sorted(counts.items()):
      print(f"  {system}: {count}")
tasks:
  - id: what-it-returns
    prompt: "Start with `parse_line`. For a good line, how many values does it give back?"
    kind: answer
    accept: ["4", "four", "4 values", "four values"]
    feedback: "Four, packed in one tuple: time, level, system, message. His docstring says so too. Neil wrote one for every function."
    wrong: "Look at the `return` line at the end of `parse_line` and count the commas."
  - id: which-line
    prompt: "Run it. Read the last line of the traceback. Which line of the log stopped it?"
    kind: answer
    accept: ["4", "line 4", "line four", "four"]
    feedback: "Line 4, which is blank. And those words are Neil's, not Python's: `raise ValueError(...)` in `parse_line` stops the program on purpose, with his own message."
    wrong: "The last line of the traceback starts with ValueError. Read what comes after it."
  - id: fog-horn
    prompt: "Why does `parse_line` split with `\"|\", 3`, at most three times? Find his comment. Which system is to blame?"
    kind: answer
    accept: ["camera", "the camera"]
    feedback: "The camera. It puts `|` in its messages, as on line 8, so the fourth piece has to keep the rest of the line together."
    wrong: "The comment is just above the `split` line."
  - id: next-stop
    prompt: "Suppose line 4 weren't there. Which line of the log would stop his script next?"
    kind: answer
    accept: ["6", "line 6", "line six", "six"]
    feedback: "Line 6: the radio wrote three parts and nothing more. After that, line 7, where `warn` isn't one of his `LEVELS`, because it's in lower case."
    wrong: "Go down the log from line 5. Which line doesn't have four parts, or has a level that isn't in LEVELS?"
  - id: which-function
    prompt: "You'll want `warn` to count as `WARN`. Which function would you change?"
    kind: answer
    accept: ["parse_line", "parse_line()", "parse line"]
    feedback: "`parse_line`. It's the only place that looks at the level before deciding whether to trust it."
    wrong: "Which function checks the level against LEVELS?"
---
Neil wrote this script in his first year. It reads `flight.log`, which every system on his drone writes to, one line per event. The time is minutes and seconds since take-off:

```
00:00 | INFO | battery | full, taking off
00:04 | INFO | gps | locked, 9 satellites
00:10 | INFO | motors | climbing to 40 m

01:05 | ERROR | camera | card full
01:15 | ERROR | radio
01:31 | warn | gps | signal weak
01:48 | ERROR | camera | write failed | tried twice
02:03 | WARNING | motors | running warm
 02:10 |  ERROR  | gps | signal lost
02:22 | INFO | radio | link good, 1.2 km
--- radio dropout ---
03:40 | ERROR | motors | temperature 950.0 C
04:02 | info | camera | recording again
04:15 | ERROR | gps | signal lost again
```

`line.split("|", 3)` cuts at the first three `|` only, so the last piece keeps the rest of the line. His comments say what each part is for, and sometimes why.
