TESTS = [
    output("High tide, light wind", inputs=["high", "12"], expect="Sailing", visible=True),
    output("High tide, a gale", inputs=["high", "40"], expect="No sailing. Gale.", visible=True),
    output("Low tide, light wind", inputs=["low", "12"], expect="No sailing. Wait for the tide.",
           hint="At low tide the wind doesn't matter. That else lines up with the tide test."),
    output("Low tide, a gale", inputs=["low", "40"], expect="No sailing. Wait for the tide."),
    output("High tide, exactly 34 knots", inputs=["high", "34"], expect="No sailing. Gale."),
]
