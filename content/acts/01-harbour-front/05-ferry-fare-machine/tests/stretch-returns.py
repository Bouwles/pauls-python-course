TESTS = [
    output("Adult night return", inputs=["34", "20", "yes"], expect="Fare: 8.00", visible=True),
    output("Child single", inputs=["10", "12", "no"], expect="Fare: 1.50", visible=True),
    output("Toddler return", inputs=["2", "12", "yes"], expect="Fare: 0.00"),
    output("Pensioner return", inputs=["80", "9", "yes"], expect="Fare: 3.00"),
]
