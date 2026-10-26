TESTS = [
    output("Four ordinary words", inputs=["tom", "the lamp goes round all night"], expect="Password accepted.", visible=True),
    output("A passphrase with the username in it", inputs=["tom", "tom keeps the lamp lit all night"],
           expect="Contains your username.\nPassword rejected.", visible=True),
    output("Short ones still get every rule", inputs=["tom", "Lamp1962"],
           expect="Too short: at least 10 characters.\nEnds in a year.\nPassword rejected."),
    output("A passphrase ending in a year", inputs=["agnes", "high water was at noon in 1987"], expect="Password accepted."),
    output("A passphrase with password in it", inputs=["agnes", "my password is the harbour wall"],
           expect="Contains the word password.\nPassword rejected."),
]
