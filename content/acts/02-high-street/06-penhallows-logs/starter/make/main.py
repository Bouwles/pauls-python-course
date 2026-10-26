# Machine log report, for Moss.
# Reads machines.log and counts the errors from each machine.
#
# Every machine writes one line each time:  time | level | machine | message
# If one ever stops doing that, this report stops too, and says which line.
# Better a loud stop than a quiet wrong answer. A.P.

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
