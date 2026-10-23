TESTS = [
    output("The 20:00 crossing", inputs=["20"], expect="Adult fare: 4.00", visible=True),
    output("The midday crossing", inputs=["12"], expect="Adult fare: 3.00", visible=True),
    output("The 5:00 crossing", inputs=["5"], expect="Adult fare: 4.00"),
    output("19:00 exactly", inputs=["19"], expect="Adult fare: 4.00",
           hint="19 is already night. Night is 19 or later."),
    output("7:00 exactly", inputs=["7"], expect="Adult fare: 3.00",
           hint="7 is the first day crossing. Night is before 7."),
]
