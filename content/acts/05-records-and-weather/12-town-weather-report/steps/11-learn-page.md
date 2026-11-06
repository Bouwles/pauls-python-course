---
id: learn-page
type: learn
title: Pictures inside a page
concept: modules
code: |
  import base64

  data = b"\x89PNG"
  letters = base64.b64encode(data).decode("ascii")
  print(letters)
  print(base64.b64decode(letters) == data)
  print(f'<img src="data:image/png;base64,{letters}">')
---
A web page is text: HTML, as in the Flask web app. A chart saved as a PNG is **bytes**, raw numbers, which can't sit in text as they are. `b"..."` is a bytes value; the example's are the first four bytes of every PNG.

**base64** writes any bytes as plain letters and digits, and back again. `base64.b64encode(data)` gives the letters, as bytes, and `.decode("ascii")` makes them a string. In a page, `<img src="data:image/png;base64,...">`, with the letters in place of the dots, shows the picture with no separate file.

To get a figure's bytes without a file, save it into `io.BytesIO()`, a file that lives in memory, then read `.getvalue()`.

The example prints `iVBORw==`, `True`, then the tag. The usual slip is putting the bytes in the page as they are.
