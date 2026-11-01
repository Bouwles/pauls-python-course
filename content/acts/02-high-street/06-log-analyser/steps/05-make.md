---
id: make
type: make
title: Teach it some manners
on_pass: { neil.proud: "Every line read or accounted for. First-year me would be impressed." }
hints:
  nudge: "The ValueError starts in parse_line. Where would you rather catch it: in parse_line itself, or in the loop that calls it for each line?"
  plan:
    - Skip blank lines before parsing them
    - Upper-case the level before checking it against LEVELS
    - Try to parse each line; catch ValueError and keep its message
    - Else, keep the entry
    - Return both lists, and unpack them where they land
    - List the skipped lines, or say Nothing skipped.
  shape: |
    def read_log(path):
        entries = []
        problems = []
        with open(path) as log:
            for number, line in enumerate(log, start=1):
                if not line.___():
                    continue
                try:
                    entry = parse_line(line, number)
                except ___ as error:
                    problems.append(___)
                else:
                    entries.append(entry)
        return ___, ___


    entries, problems = read_log(LOG_FILE)
    ...
    if problems:
        print(f"Skipped {___} lines:")
        for problem in problems:
            print(f"  {problem}")
    else:
        print("Nothing skipped.")
---
Change Neil's script so one bad line can't stop the report:

- Blank lines are skipped without a word.
- `warn` and `Warn` count as `WARN`. Any other level is still a problem.
- `read_log` catches the `ValueError` for a bad line, keeps its message, and carries on. It returns two lists: the entries, then the problems.
- The report ends with the skipped lines, or `Nothing skipped.`

```
11 entries read
Errors by system:
  camera: 2
  gps: 2
  motors: 1
Skipped 3 lines:
  line 6: expected 4 parts, got 3
  line 9: unknown level WARNING
  line 12: expected 4 parts, got 1
```

`except ValueError as error:` keeps the error in `error`, and `str(error)` is its message. Keep his comments, and add your own where you change something.
