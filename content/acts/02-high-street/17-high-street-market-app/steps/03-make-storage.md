---
id: make-storage
type: make
title: The ledger
files: [stalls.py, storage.py]
entry: storage.py
starter_from: make-stalls
on_pass: { sanjay: "Saved, closed, opened again, and nobody's lost their pitch. Better than the exercise book after the rain." }
hints:
  nudge: "What type is every value `csv.DictReader` gives you? What types do `Stall` and `Booking` need?"
  plan:
    - Open the file with with, and read the rows with csv.DictReader
    - Turn each value into the type the dataclass needs
    - Give back [] when the bookings file isn't there yet
    - Sort a copy by day and then stall, and write the header row first
  shape: |
    def load_bookings(path):
        try:
            with open(path, newline="") as bookings_file:
                return [Booking(date.___(row["day"]), ___(row["stall"]), row["trader"])
                        for row in csv.DictReader(bookings_file)]
        except ___:
            return []


    def save_bookings(path, bookings):
        in_order = sorted(bookings, key=lambda booking: (___, ___))
        with open(path, "w", newline="") as bookings_file:
            writer = csv.writer(bookings_file)
            writer.writerow(["day", "stall", "trader"])
            for booking in in_order:
                writer.writerow([___, ___, ___])
---
Now the files. `storage.py` turns CSV rows into `Stall`s and `Booking`s and back again. Your `stalls.py` comes with you from the last step.

`stalls.csv` and `bookings.csv` are already on the workbench. A day goes into the file as `2026-11-07`: `date.fromisoformat` reads that back into a date.

The hidden checks save a trader with a comma in their name, expect stall 2 before stall 14, and load a bookings file that isn't there yet.
