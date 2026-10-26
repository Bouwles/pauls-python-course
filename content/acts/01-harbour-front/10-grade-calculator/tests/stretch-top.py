TESTS = [
    output("Mr Ashby comes top", inputs=["Sanjay", "52 61 48", "Mr Ashby", "88 92 79", ""],
           expect="Sanjay: 53.7 (C)\nMr Ashby: 86.3 (A)\nClass average: 70.0\nTop: Mr Ashby (86.3)", visible=True),
    output("A tie goes to the first", inputs=["Bea Hollis", "60 70", "Sanjay", "65", ""],
           expect="Bea Hollis: 65.0 (B)\nSanjay: 65.0 (B)\nClass average: 65.0\nTop: Bea Hollis (65.0)"),
    output("Nobody, no top", inputs=["Old Tom", "", ""], expect="Old Tom: no marks yet\nClass average: no marks yet"),
]
