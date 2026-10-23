AUSTEN = [
    {"title": "Persuasion", "author": "Jane Austen", "year": "1817", "shelf": "A3"},
    {"title": "Moby-Dick", "author": "Herman Melville", "year": "1851", "shelf": "C4"},
    {"title": "Emma", "author": "Jane Austen", "year": "1815", "shelf": "A3"},
]

TESTS = [
    function("Two by Jane Austen", call="by_author", args=(AUSTEN, "Jane Austen"), expect=["Emma", "Persuasion"], visible=True),
    function("Nobody by that name", call="by_author", args=(AUSTEN, "Ada Penhallow"), expect=[]),
]
