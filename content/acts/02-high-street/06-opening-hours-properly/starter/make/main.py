# The High Street board: every shop's hours, from one module.
# Mrs Vance kept this comment from Penhallow's copy in the library:
#   Seven shops, seven copies of this. I meant to make it a module.
#   The hill took the time. A.P.
from datetime import datetime

import hours

SHOPS = {
    "Sanjay's": {"Mon": (8, 18), "Tue": (8, 18), "Wed": (8, 18), "Thu": (8, 18), "Fri": (8, 18), "Sat": (8, 13)},
    "Okonjo's": {"Tue": (10, 16), "Wed": (10, 16), "Thu": (10, 16), "Fri": (10, 16)},
    "The Library": {"Mon": (9, 17), "Wed": (9, 17), "Fri": (9, 17), "Sat": (10, 12)},
}

# One fixed moment, so the board reads the same every time it's checked.
when = datetime(2026, 3, 14, 11, 30)

print(when.strftime("%A %H:%M on the High Street"))
for shop, shop_hours in SHOPS.items():
    state = "open" if hours.is_open(shop_hours, when) else "closed"
    print(f"{shop}: {state}")

print()
print("Sanjay's door:")
for line in hours.sign(SHOPS["Sanjay's"]):
    print(f"  {line}")

# A week of Sanjay's till receipts.
visits = [
    datetime(2026, 3, 9, 8, 15),
    datetime(2026, 3, 14, 9, 0),
    datetime(2026, 3, 13, 17, 45),
    datetime(2026, 3, 14, 12, 10),
    datetime(2026, 3, 10, 8, 5),
]
print()
print("Busiest at Sanjay's:", hours.busiest_day(visits))
