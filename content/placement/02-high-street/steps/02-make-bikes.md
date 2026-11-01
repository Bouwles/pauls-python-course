---
id: make-bikes
type: make
title: Caitlin's bike hire
files: [bikes.py]
entry: bikes.py
dialogue:
  - caitlin.pleased.wave: "I'm building a bike hire app. A bike is a class."
  - neil.thinking.point: "And a shed has bikes. Write that down too."
on_pass: { caitlin.laughing.cheer: "It won't hire out a bike that's already gone. My first version did that twice." }
---
Write two classes in `bikes.py`.

`Bike(number, kind, rate)` keeps all three, with `rate` in pounds an hour, and a `rider`, which is `None` while the bike is in.

- `hire(rider)`: the bike goes out with that rider. Hiring a bike that's already out raises `ValueError`.
- `give_back(hours)`: the bike comes back in, and this gives back the charge, `rate` times `hours`, but never less than one hour's worth. Giving back a bike that isn't out raises `ValueError`.
- `str(bike)` is `Bike 3: tandem, in`, or `Bike 3: tandem, out with Riya`.
- Two bikes with the same number are equal, and `sorted` puts bikes in number order. A bike never equals something that isn't a bike.

`Shed(bikes)` keeps its own list of those bikes. `len(shed)` counts them, `3 in shed` asks whether bike 3 is there, and `shed.available()` gives back a list of the bikes that are in, by number.
