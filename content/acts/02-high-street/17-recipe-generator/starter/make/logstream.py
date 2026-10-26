# The machines log, a line at a time. It never holds more than it needs.
import argparse

LOG = "machines.log"


# read_lines(path) yields each line, without its newline, skipping blank lines.
#   Read the lines one at a time
#   Skip the notes, and the blank lines


# parse(lines) yields (time, level, machine, message) for every line with all four parts.
#   Turn each line into a tuple and hand it over


# matching(entries, level=None, machine=None) yields only the entries wanted.
#   Pass on only what's needed, as it's asked for


# first(entries, count) returns a list of the first count, taking no more.


def main():
    parser = argparse.ArgumentParser(description="Search the machines log without reading all of it.")
    parser.add_argument("--level", help="INFO, WARN or ERROR")
    parser.add_argument("--machine", help="only this machine")
    parser.add_argument("--first", type=int, default=10, help="how many to show (default 10)")
    args = parser.parse_args()

    # Chain them, and loop over the end of the chain


if __name__ == "__main__":
    main()
