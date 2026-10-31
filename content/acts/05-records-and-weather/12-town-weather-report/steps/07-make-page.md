---
id: make-page
type: make
title: The story as a web page
files: [station.py, summary.py, charts.py, report.py, page.py]
entry: report.py
starter_from: make-report
timeout_ms: 40000
dialogue:
  - aaesha: "Riya wants it on her phone. And I want a copy I can file."
  - paul: "One page, the pictures inside it. Then it can go anywhere a page can."
on_pass: { aaesha: "One file, and the charts come with it. I've printed it twice. Once to file, once for the wall." }
hints:
  nudge: "The page has to say exactly what the report prints. Where can both come from, so they can never disagree?"
  plan:
    - "page.py, figure_tag: save the figure into an io.BytesIO as a PNG at dpi=72, turn it into base64 text, and wrap it in <figure>"
    - "page.py, story_page: the head with the title, the first line as <h1>, then each line as a source, a heading or a paragraph, then the figures"
    - "report.py: collect every line in a list instead of printing it, then print the list"
    - "report.py: keep the three figures the charts give back, make a figure_tag for each, and write story_page to story.html"
  shape: |
    def figure_tag(fig, description):
        picture = io.BytesIO()
        fig.savefig(picture, format="png", dpi=___)
        encoded = base64.b64encode(picture.___()).decode("ascii")
        words = html.escape(description)
        return f'<figure><img src="data:image/png;base64,{___}" alt="{words}"><figcaption>{words}</figcaption></figure>'


    lines = []
    lines.append("The Clocktower Weather Report, 1925 to 2024")
    ...
    print("\n".join(___))
    ...
    with open("story.html", "w") as page_file:
        page_file.write(story_page(___, ___))
---
A report people read in a terminal is a report most people never read. Make it a page.

Write `figure_tag` and `story_page` in `page.py`: its requirements are at the top. Then change `report.py` so it collects its lines in a list, prints them, and writes the same list and the three charts to `story.html`. One list for both means the page can never say something the report doesn't.

A PNG is bytes, and a page is text. `base64` writes bytes as plain letters, and a browser reads them back from `src="data:image/png;base64,..."`, so the charts travel inside the page.

The checks run the report, open the page it writes, and look for every printed line in it.
