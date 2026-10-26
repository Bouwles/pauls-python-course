import secrets
import string


def locker_code(length=6):
    """Return a locker code: length random digits."""
    code = ""
    for _ in range(length):
        code += secrets.choice(string.digits)
    return code


for locker in range(1, 4):
    print(f"Locker {locker}: {locker_code()}")
