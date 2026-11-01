---
id: make-image
type: make
title: Make the picture lab
files: [lighthouse.py]
entry: lighthouse.py
on_pass: { riya.surprised.cheer: "Mirrored, turned, blurred, and the house turned and back where it started. My filters, explained." }
hints:
  nudge: "Which slice reverses the rows, and which reverses each row? And for a turn, what does the matrix do to the arrow (1, 0)?"
  plan:
    - "mirror and upside_down: a slice with ::-1, after the comma or before it"
    - "quarter_turn: upside down, then swap rows and columns"
    - "brighten: add, then clip to 0 and 255"
    - "blur: pad the edges, add the nine shifted slices, divide by 9"
    - "rotation: [[cos, -sin], [sin, cos]], the angle in radians"
    - "turn_points: the points matrix times the rotation, transposed"
  shape: |
    def quarter_turn(image):
        return upside_down(image).___


    def blur(image):
        padded = np.pad(image, 1, mode="edge")
        rows, cols = image.shape
        total = np.zeros(image.shape)
        for down in range(3):
            for across in range(3):
                total = total + padded[down:down + ___, across:across + ___]
        return total / 9


    def rotation(degrees):
        angle = np.___(degrees)
        return np.array([[np.cos(angle), ___],
                         [np.sin(angle), np.cos(angle)]])


    def turn_points(points, degrees):
        return points @ ___
---
Write seven functions in `lighthouse.py`. The photograph loads itself, and the main block works on it and shows four versions side by side.

```
Cape Lookout: 64 rows by 48 columns, brightness 0 to 229
Turned a quarter: 48 rows by 64 columns
```

- `np.clip(a, 0, 255)` keeps every value between 0 and 255.
- `np.pad(image, 1, mode="edge")` adds a border one pixel wide that repeats the edge, so `padded[1:1 + rows, 1:1 + cols]` is the picture itself and the other eight slices are it shifted a pixel each way.
- The matrix `[[cos, -sin], [sin, cos]]` turns an arrow anticlockwise. With one point per row, `points @ rotation(degrees).T` turns them all at once.

The checks turn pictures four times, blur them, and turn the keeper's house there and back.
