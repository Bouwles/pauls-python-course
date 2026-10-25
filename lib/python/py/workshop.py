"""
Living Visualisations (Section 7.6) for the learner's own code.

Call these from a program and the Workbench draws what was sent, one frame per
call, with play, pause and step controls under the output:

    from workshop import show_grid, show_graph, show_hill

    show_grid(values, policy=None, crab=None, walls=(), goal=(), q=None, title=None)
        Sir Reginald's racing grid. `values` is a list of rows of numbers (or a
        2D NumPy array); each tile is tinted by its value. `policy` is a grid of
        moves ("up", "down", "left", "right", "^", "v", "<", ">", or 0 to 3 in
        that order). `q` is a grid of lists of action values, shown on hover.

    show_graph(edges, positions=None, visited=(), frontier=(), path=(), current=None, distances=None, title=None)
        A graph drawn on the town map. `edges` is a dict of neighbours
        ({"bakery": ["pub", ...]} or {"bakery": {"pub": 3, ...}}) or a list of
        pairs or (a, b, weight) triples. Nodes named after buildings
        ("bakery", "post-office", "lighthouse"...) sit where the building is.

    show_hill(x, loss, curve=None, title=None)
        The hiker on the observatory hill. Call it once per step of gradient
        descent with the current position and loss. Pass `curve` (the loss
        function) once and the hill is drawn from it.

Nothing here changes what the program prints, and the checks never look at it.
"""

import math

MAX_FRAMES = 400  # per kind of drawing


class _Reel:
    """Frames of one kind, thinned evenly when there are too many; the last is always kept."""

    def __init__(self):
        self.frames = []
        self.stride = 1
        self.counter = 0
        self.last = None

    def add(self, frame):
        self.last = frame
        if self.counter % self.stride == 0:
            self.frames.append(frame)
            if len(self.frames) >= MAX_FRAMES:
                self.frames = self.frames[::2]
                self.stride *= 2
        self.counter += 1

    def take(self):
        frames = list(self.frames)
        if self.last is not None and (not frames or frames[-1] is not self.last):
            frames.append(self.last)
        return frames


_reels = {}
_curve = None
_hill_xs = []


def reset():
    global _reels, _curve, _hill_xs
    _reels = {}
    _curve = None
    _hill_xs = []


def _number(v, what):
    try:
        f = float(v)
    except (TypeError, ValueError):
        raise TypeError(f"{what} should be a number, not {type(v).__name__}") from None
    if math.isnan(f):
        return None
    if math.isinf(f):
        return 1e308 if f > 0 else -1e308
    return round(f, 6)


def _tolist(v):
    return v.tolist() if hasattr(v, "tolist") else v


def _cell(v):
    v = _tolist(v)
    if isinstance(v, (list, tuple)) and len(v) == 2:
        return [int(v[0]), int(v[1])]
    raise TypeError("a tile should be a (row, column) pair")


def _cells(vs):
    vs = _tolist(vs)
    if vs is None:
        return []
    if isinstance(vs, (list, tuple)) and len(vs) == 2 and all(isinstance(x, int) for x in vs):
        return [_cell(vs)]
    return [_cell(v) for v in vs]


def _record(frame):
    _reels.setdefault(frame["kind"], _Reel()).add(frame)


MOVES = {"up": "^", "down": "v", "left": "<", "right": ">", "^": "^", "v": "v", "<": "<", ">": ">", "u": "^", "d": "v", "l": "<", "r": ">"}
NUMBERED = ["^", "v", "<", ">"]


def _move(m):
    m = _tolist(m)
    if m is None:
        return None
    if isinstance(m, bool):
        raise TypeError("a move should be a direction such as 'up' or '>', or a number from 0 to 3")
    if isinstance(m, int):
        if 0 <= m < 4:
            return NUMBERED[m]
        raise ValueError(f"move {m} is not one of 0, 1, 2, 3 (up, down, left, right)")
    key = str(m).strip().lower()
    if key in MOVES:
        return MOVES[key]
    if key in ("", ".", "x", "none", "stay"):
        return None
    raise ValueError(f"{m!r} is not a move; use up, down, left or right")


def show_grid(values, policy=None, crab=None, walls=(), goal=(), q=None, title=None):
    values = _tolist(values)
    if not isinstance(values, (list, tuple)) or not values or not all(isinstance(r, (list, tuple)) for r in values):
        raise TypeError("show_grid wants the values as a list of rows, like [[0, 1], [2, 3]]")
    rows = [[None if v is None else _number(v, "each value") for v in _tolist(r)] for r in values]
    frame = {"kind": "grid", "values": rows}
    if policy is not None:
        policy = _tolist(policy)
        frame["policy"] = [[_move(m) for m in _tolist(r)] for r in policy]
    if q is not None:
        q = _tolist(q)
        if isinstance(q, dict):
            grid = [[None for _ in r] for r in rows]
            for key, acts in q.items():
                r, c = _cell(key)
                if 0 <= r < len(grid) and 0 <= c < len(grid[r]):
                    grid[r][c] = [_number(a, "each Q-value") for a in _tolist(acts)]
            frame["q"] = grid
        else:
            frame["q"] = [[None if a is None else [_number(x, "each Q-value") for x in _tolist(a)] for a in _tolist(r)] for r in q]
    if crab is not None:
        frame["crab"] = _cell(crab)
    if walls:
        frame["walls"] = _cells(walls)
    if goal is not None and (not isinstance(goal, (list, tuple)) or len(goal)):
        frame["goal"] = _cells(goal)
    if title is not None:
        frame["title"] = str(title)[:80]
    _record(frame)


def _edges(edges):
    edges = _tolist(edges)
    out = []
    if isinstance(edges, dict):
        for a, nbrs in edges.items():
            nbrs = _tolist(nbrs)
            if isinstance(nbrs, dict):
                for b, w in nbrs.items():
                    out.append([str(a), str(b), _number(w, "each weight")])
            else:
                for b in nbrs:
                    out.append([str(a), str(b), None])
    else:
        for e in edges:
            e = _tolist(e)
            if len(e) == 2:
                out.append([str(e[0]), str(e[1]), None])
            elif len(e) == 3:
                out.append([str(e[0]), str(e[1]), _number(e[2], "each weight")])
            else:
                raise TypeError("each edge should be (a, b) or (a, b, weight)")
    return out


def show_graph(edges, positions=None, visited=(), frontier=(), path=(), current=None, distances=None, title=None):
    frame = {"kind": "graph", "edges": _edges(edges)}
    nodes = []
    for a, b, _w in frame["edges"]:
        for n in (a, b):
            if n not in nodes:
                nodes.append(n)
    if isinstance(edges, dict):
        for n in edges:
            if str(n) not in nodes:
                nodes.append(str(n))
    frame["nodes"] = nodes
    if positions:
        frame["positions"] = {str(k): [_number(v[0], "x"), _number(v[1], "y")] for k, v in positions.items()}
    frame["visited"] = [str(n) for n in _tolist(visited) or ()]
    frame["frontier"] = [str(n) for n in _tolist(frontier) or ()]
    frame["path"] = [str(n) for n in _tolist(path) or ()]
    if current is not None:
        frame["current"] = str(current)
    if distances:
        frame["distances"] = {str(k): _number(v, "each distance") for k, v in distances.items()}
    if title is not None:
        frame["title"] = str(title)[:80]
    _record(frame)


def show_hill(x, loss, curve=None, title=None):
    global _curve
    if curve is not None:
        if not callable(curve):
            raise TypeError("curve should be the loss function itself, such as curve=loss")
        _curve = curve
    frame = {"kind": "hill", "x": _number(x, "x"), "loss": _number(loss, "the loss")}
    if title is not None:
        frame["title"] = str(title)[:80]
    _hill_xs.append(frame["x"])
    _record(frame)


def _sample_curve():
    """Sample the loss function over the ground the hiker covered, with a margin."""
    xs = [x for x in _hill_xs if x is not None and abs(x) < 1e6]
    if _curve is None or not xs:
        return None
    lo, hi = min(xs), max(xs)
    span = max(hi - lo, 1.0)
    lo, hi = lo - span * 0.25, hi + span * 0.25
    points = []
    for i in range(81):
        x = lo + (hi - lo) * i / 80
        try:
            y = _number(_curve(x), "the loss")
        except Exception:
            y = None
        points.append([round(x, 6), y])
    return points


def take():
    """Everything recorded since the last reset, for the host: each kind's frames in turn."""
    frames = []
    total = 0
    for reel in _reels.values():
        frames.extend(reel.take())
        total += reel.counter
    out = {"frames": frames, "total": total}
    curve = _sample_curve()
    if curve:
        out["curve"] = curve
    reset()
    return out if frames else None
