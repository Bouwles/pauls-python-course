TESTS = [
    output("The bell-ringers", inputs=["41.40", "6", "10"], expect="Total with tip: 45.54\nEach pays: 7.59", visible=True),
    output("Two people, no tip", inputs=["30", "2", "0"], expect="Total with tip: 30.00\nEach pays: 15.00", visible=True),
    output("Three ways, no tip", inputs=["11", "3", "0"], expect="Total with tip: 11.00\nEach pays: 3.67",
           hint="11 shared three ways is 3.666..., which has to be rounded to two places when it's shown."),
    output("Fifteen per cent, four ways", inputs=["36.80", "4", "15"], expect="Total with tip: 42.32\nEach pays: 10.58"),
    output("One person pays the lot", inputs=["40", "1", "15"], expect="Total with tip: 46.00\nEach pays: 46.00",
           hint="If this is the only one failing, check what happens when one person pays everything."),
    output("A share that ends in a zero", inputs=["12", "5", "0"], expect="Total with tip: 12.00\nEach pays: 2.40",
           hint="Money shows two decimal places: 2.40, not 2.4. round() won't add the zero; an f-string with :.2f will."),
    output("A 12.5 per cent service charge", inputs=["18", "4", "12.5"], expect="Total with tip: 20.25\nEach pays: 5.06",
           hint="Tips can have a decimal point. Which conversion reads 12.5?"),
]
