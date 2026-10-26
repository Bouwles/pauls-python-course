"""The report as a web page: one file, story.html, that anyone can open, with the charts inside it.

story_page(lines, figures)
    lines is the report, a line at a time, exactly as it's printed. figures is a list of
    figure_tag() strings. Gives back the whole page as one string:
    - <!DOCTYPE html>, then <html lang="en">, a <head> with <meta charset="utf-8"> and a
      <title> that is the first line, and a <body>
    - the first line again as the <h1>
    - a line that starts with "Source:" as <p class="source">
    - any other line that isn't indented as an <h2>: the report's headings
    - an indented line as a <p>, without the spaces in front
    - blank lines left out
    - then every figure, in order
    Every line of the report goes through html.escape, so a < in "p < 0.001" can't break the page.

figure_tag(fig, description)
    The figure saved as a PNG, 72 dots to the inch, put inside the page as base64 text:
    <figure><img src="data:image/png;base64,..." alt="description"><figcaption>description</figcaption></figure>
"""
import base64
import html
import io


def figure_tag(fig, description):
    """A figure as a picture inside the page, with its description underneath."""
    picture = io.BytesIO()
    fig.savefig(picture, format="png", dpi=72)
    encoded = base64.b64encode(picture.getvalue()).decode("ascii")
    words = html.escape(description)
    return f'<figure><img src="data:image/png;base64,{encoded}" alt="{words}"><figcaption>{words}</figcaption></figure>'


def story_page(lines, figures):
    """The whole report as a web page, its charts inside it."""
    title = html.escape(lines[0])
    body = [f"<h1>{title}</h1>"]
    for line in lines[1:]:
        if not line.strip():
            continue
        words = html.escape(line.strip())
        if line.startswith("Source:"):
            body.append(f'<p class="source">{words}</p>')
        elif line.startswith(" "):
            body.append(f"<p>{words}</p>")
        else:
            body.append(f"<h2>{words}</h2>")
    body.extend(figures)
    return "\n".join([
        "<!DOCTYPE html>",
        '<html lang="en">',
        f'<head><meta charset="utf-8"><title>{title}</title></head>',
        "<body>",
        *body,
        "</body>",
        "</html>",
    ]) + "\n"
