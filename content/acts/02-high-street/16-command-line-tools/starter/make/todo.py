# Paul's to-do list for the course code, for anyone with a terminal. Kept in todo.json.
import argparse
import json
import sys
from pathlib import Path


def load(path):
    """The tasks in the file, or an empty list if there's no file yet."""
    # A file that isn't JSON: say so on sys.stderr, exit with 1


def save(path, tasks):
    """Write the tasks back to the file."""


def main():
    # Describe the tool
    # Say what it takes, with types and defaults: --file, then add, list and done
    # Read what was typed
    # Do the job
    # Refuse bad values: say why on sys.stderr, exit with 1
    pass


# Run only when started as a program
if __name__ == "__main__":
    main()
