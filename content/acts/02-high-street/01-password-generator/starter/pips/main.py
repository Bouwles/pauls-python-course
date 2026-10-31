import random
import string

# Same codes every run, so every timing run is fair. Y.
random.seed(2026)


def locker_code(length=6):
    """Return a locker code: length random digits."""
    code = ""
    for _ in range(length):
        code += random.choice(string.digits)
    return code


for locker in range(1, 4):
    print(f"Locker {locker}: {locker_code()}")
