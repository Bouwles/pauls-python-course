def parse_line(line, number):
    parts = line.split("|", 3)
    if len(parts) != 4:
        raise ValueError(f"line {number}: expected 4 parts, got {len(parts)}")
    time, level, system, message = parts
    return time.strip(), level.strip().upper(), system.strip(), message.strip()


entries = []
skipped = 0
with open("flight.log") as log:
    for number, line in enumerate(log, start=1):
        try:
            entry = parse_line(line, number)
            entries.append(entrie)
        except Exception:
            skipped = skipped + 1

print(f"{len(entries)} entries read, {skipped} skipped")
