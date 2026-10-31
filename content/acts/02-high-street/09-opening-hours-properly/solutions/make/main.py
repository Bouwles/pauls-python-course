# The board by the front door: every room's hours, from one module.
# Neil's note, from the copy on the Studio wall:
#   Seven floors, seven copies of this. I meant to make it a module.
#   Then term started. N.
from datetime import datetime

import hours

ROOMS = {
    "The Studio": {"Mon": (8, 18), "Tue": (8, 18), "Wed": (8, 18), "Thu": (8, 18), "Fri": (8, 18), "Sat": (8, 13)},
    "The Makerspace": {"Tue": (10, 16), "Wed": (10, 16), "Thu": (10, 16), "Fri": (10, 16)},
    "The Workshop": {"Mon": (9, 17), "Wed": (9, 17), "Fri": (9, 17), "Sat": (10, 12)},
}

# One fixed moment, so the board reads the same every time it's checked.
when = datetime(2026, 3, 14, 11, 30)

print(when.strftime("%A %H:%M at the Clocktower"))
for room, room_hours in ROOMS.items():
    state = "open" if hours.is_open(room_hours, when) else "closed"
    print(f"{room}: {state}")

print()
print("The Studio's door:")
for line in hours.sign(ROOMS["The Studio"]):
    print(f"  {line}")

# A week of sign-ins at the Studio door.
visits = [
    datetime(2026, 3, 9, 8, 15),
    datetime(2026, 3, 14, 9, 0),
    datetime(2026, 3, 13, 17, 45),
    datetime(2026, 3, 14, 12, 10),
    datetime(2026, 3, 10, 8, 5),
]
print()
print("Busiest in the Studio:", hours.busiest_day(visits))
