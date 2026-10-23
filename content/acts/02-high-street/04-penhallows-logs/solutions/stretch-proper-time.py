LEVELS = ("INFO", "WARN", "ERROR")


def parse_line(line, number):
    """Split one log line into (time, level, machine, message)."""
    parts = line.split("|", 3)
    if len(parts) != 4:
        raise ValueError(f"line {number}: expected 4 parts, got {len(parts)}")
    time, level, machine, message = parts
    time = time.strip()
    if len(time) != 5 or time[2] != ":":
        raise ValueError(f"line {number}: bad time {time}")
    level = level.strip().upper()
    if level not in LEVELS:
        raise ValueError(f"line {number}: unknown level {level}")
    return time, level, machine.strip(), message.strip()
