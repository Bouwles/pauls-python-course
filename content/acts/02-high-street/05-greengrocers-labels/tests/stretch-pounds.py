TESTS = [
    function("Kale in pounds, plums in pence", call="labels", args=([("kale", 150, 4), ("plums", 25, 12)],),
             expect=["KALE £1.50", "PLUMS 25p"], visible=True),
    function("Exactly a pound", call="labels", args=([("melon", 100, 2), ("leeks", 80, 0)],),
             expect=["MELON £1.00", "LEEKS sold out"]),
]
