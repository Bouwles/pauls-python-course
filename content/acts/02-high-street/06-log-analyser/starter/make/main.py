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
