TESTS = [
    output("Candidate 2 comes top", inputs=["Candidate 1", "52 61 48", "Candidate 2", "88 92 79", ""],
           expect="Candidate 1: 53.7 (C)\nCandidate 2: 86.3 (A)\nClass average: 70.0\nTop: Candidate 2 (86.3)", visible=True),
    output("A tie goes to the first", inputs=["Candidate 4", "60 70", "Candidate 1", "65", ""],
           expect="Candidate 4: 65.0 (B)\nCandidate 1: 65.0 (B)\nClass average: 65.0\nTop: Candidate 4 (65.0)"),
    output("Nobody, no top", inputs=["Candidate 3", "", ""], expect="Candidate 3: no marks yet\nClass average: no marks yet"),
]
