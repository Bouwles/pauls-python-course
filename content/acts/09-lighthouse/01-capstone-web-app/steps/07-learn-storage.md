---
id: learn-storage
type: learn
title: Keeping data between runs
concept: files
code: |
  import json
  import os
  import sqlite3

  # A JSON file: read it all, change it, write a new file and swap it in.
  data = {"next_id": 2, "bookings": [{"id": 1, "boat": "Kittiwake"}]}
  with open("bookings.json.new", "w") as new_file:
      json.dump(data, new_file)
  os.replace("bookings.json.new", "bookings.json")
  with open("bookings.json") as data_file:
      print(json.load(data_file)["bookings"])

  # SQLite: a database in one file. AUTOINCREMENT never gives a number out twice.
  db = sqlite3.connect("marina.db")
  db.execute("CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, boat TEXT)")
  db.execute("INSERT INTO bookings (boat) VALUES (?)", ("Kittiwake",))
  db.commit()
  print(db.execute("SELECT id, boat FROM bookings").fetchall())
---
A server is switched off every evening, and everything in its variables goes with it. Bookings have to live in a file. Two good ways, both already in Python:

- A **JSON file**: read the whole file, change it, write it back with `json.dump`. Write a new file first and swap it in with `os.replace`, so a crash halfway can't leave half a file. Keep the next booking number in the file too.
- **SQLite**: a small database in one file, with `sqlite3.connect`. You ask it things in SQL, its own language. Declare the id `INTEGER PRIMARY KEY AUTOINCREMENT`, or it may give a cancelled booking's number out again.

The example does both, and prints the JSON file's booking, then `[(1, 'Kittiwake')]` from the database.

The usual mistake is crashing on the first run, before any file exists. No file means no bookings yet.
