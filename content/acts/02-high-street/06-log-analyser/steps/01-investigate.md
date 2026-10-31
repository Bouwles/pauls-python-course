---
id: investigate
type: investigate
title: Read it before you touch it
concept: exceptions
dialogue:
  - paul: "Neil's script, as he left it. Read it top to bottom before you run anything."
code: |
  # Machine log report, for the Clocktower.
  # Reads machines.log and counts the errors from each machine.
  #
  # Every machine writes one line each time:  time | level | machine | message
  # If one ever stops doing that, this report stops too, and says which line.
  # Better a loud stop than a quiet wrong answer. N.

  LOG_FILE = "machines.log"

  # Every level a machine is allowed to use. Anything else is a machine
  # making things up, which the printer does on Mondays.
  LEVELS = ("INFO", "WARN", "ERROR")


  def parse_line(line, number):
      """Split one log line into (time, level, machine, message)."""
      # At most 3 splits: the printer puts | in its messages. I asked it not to.
      parts = line.split("|", 3)
      if len(parts) != 4:
          # Always say which line. Nobody finds line 4,012 by looking.
          raise ValueError(f"line {number}: expected 4 parts, got {len(parts)}")
      time, level, machine, message = parts
      level = level.strip()
      if level not in LEVELS:
          raise ValueError(f"line {number}: unknown level {level}")
      return time.strip(), level, machine.strip(), message.strip()


  def read_log(path):
      """Read every line of the log. Returns a list of parsed entries."""
      entries = []
      with open(path) as log:
          # Lines are counted from 1, because people count from 1.
          for number, line in enumerate(log, start=1):
              entries.append(parse_line(line, number))
      return entries


  def count_errors(entries):
      """Count the ERROR entries for each machine. Returns a dict."""
      counts = {}
      for time, level, machine, message in entries:
          if level == "ERROR":
              counts[machine] = counts.get(machine, 0) + 1
      return counts


  entries = read_log(LOG_FILE)
  counts = count_errors(entries)

  print(f"{len(entries)} entries read")
  print("Errors by machine:")
  for machine, count in sorted(counts.items()):
      print(f"  {machine}: {count}")
tasks:
  - id: what-it-returns
    prompt: "Start with `parse_line`. For a good line, how many values does it give back?"
    kind: answer
    accept: ["4", "four", "4 values", "four values"]
    feedback: "Four, packed in one tuple: time, level, machine, message. The line in triple quotes under `def` says so too. Neil wrote one for every function."
    wrong: "Look at the `return` line at the end of `parse_line` and count the commas."
  - id: which-line
    prompt: "Run it. Read the last line of the traceback. Which line of the log stopped it?"
    kind: answer
    accept: ["4", "line 4", "line four", "four"]
    feedback: "Line 4, which is blank. And those words are Neil's, not Python's: `raise ValueError(...)` in `parse_line` stops the program on purpose, with his own message."
    wrong: "The last line of the traceback starts with ValueError. Read what comes after it."
  - id: fog-horn
    prompt: "Why does `parse_line` split with `\"|\", 3`, at most three times? Find his comment. Which machine is to blame?"
    kind: answer
    accept: ["printer", "the printer"]
    feedback: "The printer. It puts `|` in its messages, as on line 8, so the fourth piece has to keep the rest of the line together."
    wrong: "The comment is just above the `split` line."
  - id: next-stop
    prompt: "Suppose line 4 weren't there. Which line of the log would stop his script next?"
    kind: answer
    accept: ["6", "line 6", "line six", "six"]
    feedback: "Line 6: the front door wrote three parts and nothing more. After that, line 7, where `warn` isn't one of his `LEVELS`, because it's in lower case."
    wrong: "Go down the log from line 5. Which line doesn't have four parts, or has a level that isn't in LEVELS?"
  - id: which-function
    prompt: "You'll want `warn` to count as `WARN`. Which function would you change?"
    kind: answer
    accept: ["parse_line", "parse_line()", "parse line"]
    feedback: "`parse_line`. It's the only place that looks at the level before deciding whether to trust it."
    wrong: "Which function checks the level against LEVELS?"
---
Neil wrote this script in his first year. It reads `machines.log`, which every machine in the Clocktower writes to:

```
02:00 | INFO | server | backup done
06:00 | INFO | lights | lights off, dawn
06:42 | INFO | thermostat | heating on, 19.5 C

07:05 | ERROR | printer | out of paper
07:15 | ERROR | front-door
07:31 | warn | lights | bulb flickering
07:48 | ERROR | printer | paper jam | tried twice
08:03 | WARNING | thermostat | reading late
 08:10 |  ERROR  | lights | bulb failed
08:22 | INFO | front-door | 14 people in
--- power cut ---
09:40 | ERROR | thermostat | reading 195.0 C
10:02 | info | printer | paper loaded
10:15 | ERROR | lights | bulb failed again
```

His comments say what each part is for, and sometimes why. Read the script, then answer the questions.
