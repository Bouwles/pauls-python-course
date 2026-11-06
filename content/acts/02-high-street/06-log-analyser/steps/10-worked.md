---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "My laptop's log of overnight training runs. It's had some odd nights."
code: |
  # Paul's overnight training runs: run | status | minutes
  RUNS = [
      "1 | done | 42",
      "",
      "2 | Done | 38",
      "3 | crashed",
      "4 | DONE | 40",
      "5 | paused | 12",
  ]
  STATUSES = ("DONE", "STOPPED", "CRASHED")


  def parse_run(line, number):
      """Split one line into (run, status, minutes)."""
      parts = line.split("|")
      if len(parts) != 3:
          raise ValueError(f"line {number}: expected 3 parts, got {len(parts)}")
      run, status, minutes = parts
      status = status.strip().upper()
      if status not in STATUSES:
          raise ValueError(f"line {number}: unknown status {status}")
      return run.strip(), status, int(minutes)


  def read_runs(lines):
      """Parse every line that makes sense. Returns the runs, then the problems."""
      runs = []
      problems = []
      for number, line in enumerate(lines, start=1):
          if not line.strip():
              continue
          try:
              run = parse_run(line, number)
          except ValueError as error:
              problems.append(str(error))
          else:
              runs.append(run)
      return runs, problems


  runs, problems = read_runs(RUNS)
  print(f"{len(runs)} runs read")
  if problems:
      print(f"Skipped {len(problems)} lines:")
      for problem in problems:
          print(f"  {problem}")
  else:
      print("Nothing skipped.")
subgoals:
  - label: Upper-case the status before checking it
    lines: [19, 21]
  - label: Skip blank lines before parsing them
    lines: [30, 31]
  - label: Try to parse each line; catch ValueError and keep its message
    lines: [32, 35]
  - label: Else, keep the entry
    lines: [36, 37]
  - label: Return both lists, and unpack them where they land
    lines: [38, 41]
  - label: List the skipped lines, or say Nothing skipped.
    lines: [43, 48]
explain:
  prompt: "Why does Paul put `runs.append(run)` under `else`, and not inside the `try`?"
  answer: "The `try` holds only the line that might fail, so the `except` can only catch the error he expects from `parse_run`. The good run is kept in `else`, which runs only when nothing went wrong."
  concept: try-except
---
Paul's log has the same troubles as Neil's: a blank line, statuses in any capitals, a line with a part missing and a status nobody planned for.

`parse_run` raises a `ValueError` for a line it can't trust. `read_runs` catches it, keeps the message and moves on, then hands back two lists. If `problems` is an empty list, `if problems:` is false, as empty text is.

The labels beside the code are the steps he took. Neil's script needs the same ones.
