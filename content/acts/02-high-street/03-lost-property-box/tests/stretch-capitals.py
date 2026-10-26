TESTS = [
    function("Red Scarf and red scarf", call="report", args=(["Red Scarf", "red scarf", "Glove"], ["RED SCARF"]),
             prints="Handed in: 2 different items\nMatched: red scarf\nNobody has asked about: glove\nStill missing: none",
             visible=True),
    function("Capitals in reported only", call="report", args=(["kite", "oar"], ["Kite", "Flask"]),
             prints="Handed in: 2 different items\nMatched: kite\nNobody has asked about: oar\nStill missing: flask"),
]
