# The machines log, a line at a time. It never holds more than it needs.
import argparse

LOG = "machines.log"


def read_lines(path):
    """Each line of the file, without its newline. Blank lines are skipped."""
    # Read the lines one at a time
    with open(path) as log:
        for line in log:
            line = line.rstrip("\n")
            # Skip the notes, and the blank lines
            if line.strip():
                yield line


def parse(lines):
    """(time, level, machine, message) for every line that has all four parts."""
    for line in lines:
        parts = line.split("|", 3)
        if len(parts) != 4:
            continue
        time, level, machine, message = parts
        # Turn each line into a tuple and hand it over
        yield time.strip(), level.strip().upper(), machine.strip(), message.strip()


def matching(entries, level=None, machine=None):
    """Only the entries at this level, from this machine. None means any."""
    # Pass on only what's needed, as it's asked for
    for entry in entries:
        time, entry_level, entry_machine, message = entry
        if level is not None and entry_level != level.upper():
            continue
        if machine is not None and entry_machine != machine:
            continue
        yield entry


def first(entries, count):
    """A list of the first count entries, taking no more than that."""
    found = []
    if count <= 0:
        return found
    for entry in entries:
        found.append(entry)
        if len(found) == count:
            break
    return found


def main():
    parser = argparse.ArgumentParser(description="Search the machines log without reading all of it.")
    parser.add_argument("--level", help="INFO, WARN or ERROR")
    parser.add_argument("--machine", help="only this machine")
    parser.add_argument("--first", type=int, default=10, help="how many to show (default 10)")
    args = parser.parse_args()

    # Chain them, and loop over the end of the chain
    entries = matching(parse(read_lines(LOG)), level=args.level, machine=args.machine)
    shown = first(entries, args.first)
    if not shown:
        print("Nothing found.")
    for time, level, machine, message in shown:
        print(f"{time} {level} {machine}: {message}")


if __name__ == "__main__":
    main()
