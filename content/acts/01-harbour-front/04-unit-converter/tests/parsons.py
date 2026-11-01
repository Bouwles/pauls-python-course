TESTS = [
    output("Dry and mild", inputs=["dry", "25"], expect="Soft tyres", visible=True),
    output("Dry and scorching", inputs=["dry", "48"], expect="Hard tyres. Too hot for softs.", visible=True),
    output("Wet and mild", inputs=["wet", "25"], expect="Wet tyres. Whatever the temperature.",
           hint="When it's wet the temperature doesn't matter. That else lines up with the track test."),
    output("Wet and scorching", inputs=["wet", "48"], expect="Wet tyres. Whatever the temperature."),
    output("Dry, exactly 40 degrees", inputs=["dry", "40"], expect="Hard tyres. Too hot for softs."),
]
