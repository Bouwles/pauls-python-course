TESTS = [
    output("Four ordinary words", inputs=["yahya", "the clock is stuck at three fourteen"], expect="Password accepted.", visible=True),
    output("A passphrase with the username in it", inputs=["yahya", "yahya cleans every dataset twice"],
           expect="Contains your username.\nPassword rejected.", visible=True),
    output("Short ones still get every rule", inputs=["paul", "Clock0314"],
           expect="Too short: at least 10 characters.\nEnds in a year.\nPassword rejected."),
    output("A passphrase ending in a year", inputs=["aaesha", "attention is a spotlight 2024"], expect="Password accepted."),
    output("A passphrase with password in it", inputs=["aaesha", "my password is on the engine room wall"],
           expect="Contains the word password.\nPassword rejected."),
]
