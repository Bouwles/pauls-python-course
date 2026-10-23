---
id: test-first
type: modify
title: Tests first
files: [tides.py, test_tides.py]
entry: test_tides.py
dialogue:
  - agnes: "Requirement four. The Kittiwake draws two metres. She crosses with half a metre under her, or not at all."
on_pass: { agnes: "Room to spare, too shallow, exactly enough, and a cautious skipper. That's the list I'd have written." }
hints:
  nudge: "The Kittiwake draws 2.0 metres. What is the least depth at which she can cross, and what if her skipper wants a whole metre?"
  plan:
    - Name each test for the case it checks
    - A boat that can cross, and one that can't
    - "The boundary: exactly the draught plus the margin"
    - A call that names its own margin
  shape: |
    def test_can_cross_with_room_to_spare():
        assert can_cross(3.0, 2.0)


    def test_cannot_cross_in_shallow_water():
        assert ___ can_cross(2.2, 2.0)


    def test_can_cross_exactly_at_the_margin():
        assert can_cross(___, 2.0)


    def test_cautious_skipper():
        assert not can_cross(2.75, 2.0, margin=___)
---
`can_cross(depth, draught, margin=0.5)` should be `True` when the depth of water is at least the boat's draught plus the margin.

It doesn't exist yet: `tides.py` has its docstring and a line that raises an error. Write its tests first, in `test_tides.py`. Run them, and they fail. That's the point: a test you've seen fail is a test you know can fail. Writing it first also makes you decide exactly what the function should do before you're attached to how it does it.

When you press Check, your tests run against a correct `can_cross` Moss keeps on the back bench, then against broken ones.
