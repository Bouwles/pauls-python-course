---
id: learn-pages
type: learn
title: Pages and forms
concept: http-basics
---
Flask fills pages in from **templates**, HTML files in `templates/` with gaps for your values. It runs at home, so this one is to read.

```python
@app.get("/")
def front_page():
    return render_template("index.html", berths=BERTHS)


@app.post("/book")
def book_from_form():
    length = float(request.form["length"])
    ...
    return redirect(url_for("front_page"), code=303)
```

- `render_template` fills the gaps. It **escapes** what it shows, so a boat named `<b>Bold</b>` appears as those characters, not as bold text. Build HTML with f-strings and you lose that.
- A form with `method="post"` sends its fields as `request.form`, and every field arrives as text, numbers included.
- After a booking succeeds, answer with `redirect(..., code=303)`. The browser then asks for the page afresh, so pressing refresh can't book twice.
