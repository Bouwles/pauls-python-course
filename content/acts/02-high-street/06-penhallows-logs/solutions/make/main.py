# Machine log report, for Moss.
# Reads machines.log and counts the errors from each machine.
#
# Every machine writes one line each time:  time | level | machine | message
# If one ever stops doing that, this report stops too, and says which line.
# Better a loud stop than a quiet wrong answer. A.P.
#
# Not any more: bad lines are now skipped and listed at the end, so one
# broken machine can't hide what the others said.

LOG_FILE = "machines.log"

# Every level a machine is allowed to use. Anything else is a machine
# making things up, which the fog horn does in cold weather.
LEVELS = ("INFO", "WARN", "ERROR")


def parse_line(line, number):
    """Split one log line into (time, level, machine, message)."""
    # At most 3 splits: the fog horn puts | in its messages. I asked it not to.
    parts = line.split("|", 3)
    if len(parts) != 4:
        # Always say which line. Nobody finds line 4,012 by looking.
        raise ValueError(f"line {number}: expected 4 parts, got {len(parts)}")
    time, level, machine, message = parts
    # Some machines write warn or Info. They mean WARN and INFO.
    level = level.strip().upper()
    if level not in LEVELS:
        raise ValueError(f"line {number}: unknown level {level}")
    return time.strip(), level, machine.strip(), message.strip()


def read_log(path):
    """Read every line of the log. Returns (entries, problems)."""
    entries = []
    problems = []
    with open(path) as log:
        # Lines are counted from 1, because people count from 1.
        for number, line in enumerate(log, start=1):
            # A blank line is nothing to report.
            if not line.strip():
                continue
            try:
                entry = parse_line(line, number)
            except ValueError as error:
                problems.append(str(error))
            else:
                entries.append(entry)
    return entries, problems


def count_errors(entries):
    """Count the ERROR entries for each machine. Returns a dict."""
    counts = {}
    for time, level, machine, message in entries:
        if level == "ERROR":
            counts[machine] = counts.get(machine, 0) + 1
    return counts


entries, problems = read_log(LOG_FILE)
counts = count_errors(entries)

print(f"{len(entries)} entries read")
print("Errors by machine:")
for machine, count in sorted(counts.items()):
    print(f"  {machine}: {count}")
if problems:
    print(f"Skipped {len(problems)} lines:")
    for problem in problems:
        print(f"  {problem}")
else:
    print("Nothing skipped.")
