"""Your first program on your own computer."""
import sys


def greeting(name):
    """Return Moss's morning greeting for name: greeting("Bea") is "Morning, Bea."."""
    # Write this. Spaces around the name shouldn't end up in the greeting.
    return ""


if __name__ == "__main__":
    # Run as `python hello.py Ferro`: the name comes from the command line.
    name = sys.argv[1] if len(sys.argv) > 1 else "Moss"
    print(greeting(name))
