TESTS = [
    output("Tonight: 8.5 degrees, 1024 hPa, 70%, 5 knots, 1 okta", expect="Tonight's low: 3.5 degrees", visible=True),
    output("A wet, windy, cloudy evening", set_vars={"TONIGHT": [12.0, 1003.0, 92.0, 18.0, 7.0]},
           expect="Tonight's low: 11.4 degrees", visible=True,
           hint="Scale tonight with the means and spreads of the old nights, and only theirs."),
    output("A still, clear, high-pressure evening", set_vars={"TONIGHT": [2.0, 1035.0, 58.0, 1.0, 0.0]},
           expect="Tonight's low: -2.9 degrees",
           hint="If only this fails, check nothing about tonight goes into the means and spreads: they belong to the old nights."),
    output("An ordinary evening", set_vars={"TONIGHT": [7.0, 1019.0, 75.0, 8.0, 4.0]},
           expect="Tonight's low: 4.3 degrees"),
]
