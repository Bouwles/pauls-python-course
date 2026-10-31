def report(ctx, files=None):
    import matplotlib.pyplot as plt

    result = ctx.run_program(files=files)
    figures = len(plt.get_fignums())
    plt.close("all")
    if result.error is not None:
        raise CheckFailed("report.py stopped with an error.", actual=f"{type(result.error).__name__}: {result.error}")
    return result.output, figures


def has(output, text, what):
    if text not in output:
        raise CheckFailed(f"The report should print {what}.", expected=text, actual=output[:600])


def altered_ledger(ctx):
    """The ledger with the last ten years a degree warmer and 1982 much wetter."""
    lines = ctx.files["ledger.csv"].splitlines()
    out = [lines[0]]
    for line in lines[1:]:
        month, temp, unit, rain, sun = line.split(",")
        year = int(month.split("-")[0])
        if year >= 2015:
            temp = f"{float(temp) + 1.0:.1f}"
        if year == 1982:
            rain = f"{float(rain) + 40.0:.1f}"
        out.append(",".join([month, temp, unit, rain, sun]))
    return "\n".join(out) + "\n"


def heading(ctx):
    output, _ = report(ctx)
    lines = [line.strip() for line in output.splitlines()]
    if not lines or lines[0] != "The Clocktower Weather Report, 1925 to 2024":
        raise CheckFailed("The report's first line is its title.", expected="The Clocktower Weather Report, 1925 to 2024",
                          actual=lines[0] if lines else "(nothing printed)")
    has(output, "Source: Clocktower weather station book", "where its numbers came from")


def the_record(ctx):
    output, _ = report(ctx)
    has(output, "1200 months, missing months: none", "how many months there are, and which are missing")
    has(output, "Warmest year: 2022 (12.99 degrees C). Coldest: 1963 (9.84 degrees C)", "the warmest and coldest years")
    has(output, "Wettest year: 1960 (1439 mm). Driest: 1982 (798 mm)", "the wettest and driest years")


def then_and_now(ctx):
    import re

    output, _ = report(ctx)
    has(output, "Then and now: 1995 to 2024 against 1925 to 1954", "which thirty years it compares")
    has(output, "Temperature: +0.86 degrees C (p < 0.001)", "the change in temperature, with its p")
    if not re.search(r"Rain: -35 mm a year \(p = 0\.[12]\d\)", output):
        raise CheckFailed("The report should print the change in rain, with its p.", expected="Rain: -35 mm a year (p = 0.21)", actual=output[:600])
    if not re.search(r"Sunshine: \+26 hours a year \(p = 0\.[345]\d\)", output):
        raise CheckFailed("The report should print the change in sunshine, with its p.", expected="Sunshine: +26 hours a year (p = 0.43)", actual=output[:600])
    has(output, "Warming over the century: 0.13 degrees C a decade", "the warming trend")
    has(output, "Warmed most on the 1961 to 1990 normal: June, +1.50 degrees C", "the month that has warmed most")


def from_the_data(ctx):
    output, _ = report(ctx, files={"ledger.csv": altered_ledger(ctx)})
    has(output, "Warmest year: 2022 (13.99 degrees C)", "the warmest year from whatever ledger it reads")
    if "Driest: 1982" in output or "Driest: 1980 (827 mm)" not in output:
        raise CheckFailed("With 1982 made wetter, the driest year should change.", expected="Driest: 1980 (827 mm)", actual=output[:600])
    has(output, "Temperature: +1.19 degrees C", "the change in temperature from whatever ledger it reads")
    has(output, "Warming over the century: 0.18 degrees C a decade", "the warming trend from whatever ledger it reads")


def three_charts(ctx):
    _, figures = report(ctx)
    if figures < 3:
        raise CheckFailed("The report should draw its three charts: temperature, rain and the months.", expected=3, actual=figures)


def conclusion(ctx):
    output, _ = report(ctx)
    lines = output.splitlines()
    starts = [i for i, line in enumerate(lines) if line.strip() == "Conclusion"]
    if not starts:
        raise CheckFailed("The report should have a line saying Conclusion, with your paragraph under it.")
    words = " ".join(lines[starts[-1] + 1:]).split()
    if len(words) < 50:
        raise CheckFailed("The conclusion should be a paragraph of at least 50 words: what changed, how sure you are, what didn't, and what one station can't say.",
                          expected="50 words or more", actual=f"{len(words)} words")


TESTS = [
    custom("A title, and where the numbers came from", heading, visible=True),
    custom("The record", the_record, visible=True),
    custom("Then and now", then_and_now,
           hint="Signs come from the format: f\"{change:+.2f}\" prints +0.86. A p of 0 prints as p < 0.001."),
    custom("Worked out, not typed in", from_the_data,
           hint="Every number in the report should come from your functions, run on ledger.csv. The check changes the ledger and expects the report to change with it."),
    custom("Three charts", three_charts),
    custom("A conclusion of your own", conclusion),
]
