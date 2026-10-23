"""Moss's label printer."""

# label(*lines, border="-", width=24)
#   Say what it does, in a docstring
#   Make the border and cut each line to width
#   Join the border, the lines and the border, and return them


# tag(item, owner="Moss", **notes)
#   Say what it does, in a docstring
#   Start with the line every label has
#   Add one line per note
#   Hand the lines to label() with a = border


# add_to_queue(text, waiting=None)
#   Say what it does, in a docstring
#   A new list when none is given, then append and return


if __name__ == "__main__":
    print(tag("kettle", owner="Bea", spout="rewelded", handle="new"))
