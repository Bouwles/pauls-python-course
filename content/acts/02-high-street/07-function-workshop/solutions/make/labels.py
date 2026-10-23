"""Moss's label printer."""


def label(*lines, border="-", width=24):
    """Return a label: a border, each line cut to width, then the border again."""
    edge = border * width
    body = [line[:width] for line in lines]
    return "\n".join([edge] + body + [edge])


def tag(item, owner="Moss", **notes):
    """Return a repair tag with a = border: ITEM for owner, then one line per note."""
    lines = [f"{item.upper()} for {owner}"]
    for name, value in notes.items():
        lines.append(f"{name}: {value}")
    return label(*lines, border="=")


def add_to_queue(text, waiting=None):
    """Add text to the waiting list and return it. With no list, start a new one."""
    if waiting is None:
        waiting = []
    waiting.append(text)
    return waiting


if __name__ == "__main__":
    print(tag("kettle", owner="Bea", spout="rewelded", handle="new"))
