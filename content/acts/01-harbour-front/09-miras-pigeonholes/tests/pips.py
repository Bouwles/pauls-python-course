import ast as _ast


def five_parcels(ctx):
    """Run the fixed loop on a longer list, to be sure it follows len and not a fixed 4."""
    tree = _ast.parse(ctx.source)
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Assign) and any(isinstance(t, _ast.Name) and t.id == "parcels" for t in node.targets):
            node.value = _ast.parse('["Bea Hollis", "Old Tom", "Agnes Rook", "Gwen", "Moss"]', mode="eval").body
            break
    source = _ast.unparse(tree)
    r = ctx.run_program(files={ctx.entry: source})
    expected = "Hole 0: Bea Hollis\nHole 1: Old Tom\nHole 2: Agnes Rook\nHole 3: Gwen\nHole 4: Moss"
    if r.error is not None or norm_lines(r.output) != norm_lines(expected):
        raise CheckFailed("With a fifth parcel, the loop should list five holes. Use len(parcels), not a fixed number.",
                          expected=expected, actual=r.output)


TESTS = [
    output("Four parcels", expect="Hole 0: Bea Hollis\nHole 1: Old Tom\nHole 2: Agnes Rook\nHole 3: Gwen", visible=True,
           hint="Mira's holes start at 0, and so do list indexes. range(len(parcels)) gives 0 to 3."),
    custom("A fifth parcel arrives", five_parcels,
           hint="If only this one fails, the loop is counting to a fixed number instead of len(parcels)."),
]
