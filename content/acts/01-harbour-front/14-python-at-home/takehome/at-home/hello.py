"""Your first program on your own computer."""
import sys


def greeting(name):
    """Return Neil's morning greeting for name: greeting("Riya") is "Morning, Riya."."""
    # Write this. Spaces around the name shouldn't end up in the greeting.
    return ""


if __name__ == "__main__":
    # Run as `python hello.py Paul`: the name comes from the command line.
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = "Neil"
    print(greeting(name))
