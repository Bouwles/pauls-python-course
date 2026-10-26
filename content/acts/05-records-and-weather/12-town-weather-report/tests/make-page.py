LINES = [
    "The Harbour Wall Report, 1990 to 1999",
    "Source: the harbour master's tide book",
    "",
    "The record",
    "  120 months, missing months: none",
    "  Highest tide: 1990 (5.2 m)",
    "",
    "Conclusion",
    "  Higher, and sure of it (p < 0.001).",
]

PAGE = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>The Harbour Wall Report, 1990 to 1999</title></head>
<body>
<h1>The Harbour Wall Report, 1990 to 1999</h1>
<p class="source">Source: the harbour master&#x27;s tide book</p>
<h2>The record</h2>
<p>120 months, missing months: none</p>
<p>Highest tide: 1990 (5.2 m)</p>
<h2>Conclusion</h2>
<p>Higher, and sure of it (p &lt; 0.001).</p>
<figure>one</figure>
<figure>two</figure>
</body>
</html>
"""


def small_page(ctx):
    got = ctx.module().story_page(list(LINES), ["<figure>one</figure>", "<figure>two</figure>"])
    if got != PAGE:
        raise CheckFailed("story_page gives the wrong page for a small report.", expected=PAGE, actual=got)


def escaped(ctx):
    got = ctx.module().story_page(["Rain & sun", "  p < 0.05 > nothing"], [])
    if "<title>Rain &amp; sun</title>" not in got or "<p>p &lt; 0.05 &gt; nothing</p>" not in got:
        raise CheckFailed("Every line should go through html.escape, so & < and > can't break the page.",
                          expected="<title>Rain &amp; sun</title> ... <p>p &lt; 0.05 &gt; nothing</p>", actual=got)


def a_picture(ctx):
    import base64

    import matplotlib.pyplot as plt

    fig, ax = plt.subplots()
    ax.plot([1, 2, 3], [3, 1, 2])
    try:
        got = ctx.module().figure_tag(fig, "Tides & surges")
    finally:
        plt.close("all")
    start = '<figure><img src="data:image/png;base64,'
    if not isinstance(got, str) or not got.startswith(start):
        raise CheckFailed("figure_tag should give back a <figure> with an <img> whose src is data:image/png;base64, then the picture.",
                          expected=start + "...", actual=str(got)[:80])
    encoded = got[len(start):got.index('"', len(start))]
    if not base64.b64decode(encoded).startswith(b"\x89PNG"):
        raise CheckFailed("The picture inside the src should be the figure saved as a PNG, then turned into base64 text.")
    if not got.endswith('" alt="Tides &amp; surges"><figcaption>Tides &amp; surges</figcaption></figure>'):
        raise CheckFailed("After the picture: the description as the alt text and as the caption, both escaped.", actual=got[-90:])


_STORY = {}


def the_story(ctx):
    import matplotlib.pyplot as plt

    if "result" in _STORY:
        return _STORY["result"]
    result = ctx.run_program()
    plt.close("all")
    if result.error is not None:
        raise CheckFailed("report.py stopped with an error.", actual=f"{type(result.error).__name__}: {result.error}")
    if "Saved story.html" not in result.output:
        raise CheckFailed("After the report, print Saved story.html.")
    page = result.files_out.get("story.html")
    if page is None:
        raise CheckFailed("report.py should write story.html. If it did, the page may be over 200 KB: save the figures at dpi=72.")
    _STORY["result"] = (result.output, page)
    return result.output, page


def page_of_the_report(ctx):
    output, page = the_story(ctx)
    if not page.startswith("<!DOCTYPE html>"):
        raise CheckFailed("story.html should start with <!DOCTYPE html>.", actual=page[:40])
    if "<h1>The {{town}} Weather Report, 1925 to 2024</h1>" not in page:
        raise CheckFailed("The page's heading is the report's first line.")
    if page.count('<img src="data:image/png;base64,') != 3:
        raise CheckFailed("The page should hold the report's three charts.", expected=3, actual=page.count("<img"))


def says_what_it_prints(ctx):
    import html

    output, page = the_story(ctx)
    for line in output.splitlines():
        if line.strip() and line.strip() != "Saved story.html" and html.escape(line.strip()) not in page:
            raise CheckFailed("Every line the report prints should be on the page too, from the same list of lines.",
                              expected=line.strip(), actual="not on the page")


TESTS = [
    custom("A small report as a page", small_page, visible=True,
           hint="The first line is the title and the <h1>; Source: lines are p class=\"source\"; other lines at the edge are <h2>; indented lines are <p>; blank lines are left out."),
    custom("The weather report, as story.html", page_of_the_report, visible=True,
           hint="Collect the report's lines in a list instead of printing them as you go, print them all, then write story_page(lines, figures) to story.html."),
    custom("Nothing breaks the page", escaped, hint="html.escape(line) turns & < > into &amp; &lt; &gt;."),
    custom("A chart inside the page", a_picture,
           hint="fig.savefig(buffer, format=\"png\", dpi=72) into an io.BytesIO, then base64.b64encode(buffer.getvalue()).decode(\"ascii\")."),
    custom("The page says what the report says", says_what_it_prints),
]
