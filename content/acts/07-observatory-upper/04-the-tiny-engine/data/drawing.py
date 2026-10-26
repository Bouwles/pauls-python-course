"""Wendt's drawing helper: a Value's graph on the map. For looking at; the checks never use it."""

from workshop import show_graph


def draw_graph(root, title="Every value, with its gradient"):
    """Draw root and everything it was made from, each with its .grad in brackets."""
    level = {root: 0}
    found = [root]
    for value in found:                  # from the answer back, a step at a time
        for parent in value.parents:
            if parent not in level:
                level[parent] = level[value] + 1
                found.append(parent)

    names = {}
    positions = {}
    rows = {}
    for number, value in enumerate(found):
        what = value.op or "number"
        names[value] = f"{number}: {what} {value.data:.3g}"
        row = rows.get(level[value], 0)
        rows[level[value]] = row + 1
        positions[names[value]] = (-level[value], row)

    edges = [(names[parent], names[value]) for value in found for parent in value.parents]
    show_graph(edges or [(names[root], names[root])], positions=positions,
               distances={names[v]: v.grad for v in found}, current=names[root], title=title)
