TESTS = [
    output("Dry and mild", inputs=["dry", "12"], expect="Run outside", visible=True),
    output("Dry and a heatwave", inputs=["dry", "34"], expect="Treadmill. Too hot.", visible=True),
    output("Wet and mild", inputs=["wet", "12"], expect="Treadmill. Wait for the rain to stop.",
           hint="When it's wet the temperature doesn't matter. That else lines up with the weather test."),
    output("Wet and a heatwave", inputs=["wet", "34"], expect="Treadmill. Wait for the rain to stop."),
    output("Dry, exactly 30 degrees", inputs=["dry", "30"], expect="Treadmill. Too hot."),
]
