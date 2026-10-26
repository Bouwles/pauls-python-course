TESTS = [
    output("A penny short", inputs=["23.50", "4", "10"], expect="Total with tip: 25.85\nEach pays: 6.46\nCollected: 25.84", visible=True),
    output("Exactly right", inputs=["41.40", "6", "10"], expect="Total with tip: 45.54\nEach pays: 7.59\nCollected: 45.54", visible=True),
    output("A penny over", inputs=["11", "3", "0"], expect="Total with tip: 11.00\nEach pays: 3.67\nCollected: 11.01",
           hint="Round each share to two places first, then multiply by the number of people."),
]
