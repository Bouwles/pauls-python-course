TESTS = [
    output("High tide, 20:00", inputs=["high", "20"], expect="Night crossing", visible=True),
    output("High tide, midday", inputs=["high", "12"], expect="Day crossing", visible=True),
    output("Low tide, midday", inputs=["low", "12"], expect="No crossing. Wait for the tide.",
           hint="At low tide the clock doesn't matter. That else lines up with the tide test."),
    output("Low tide, 22:00", inputs=["low", "22"], expect="No crossing. Wait for the tide."),
]
