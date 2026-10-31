LOG = """The log, before any chapters.
CHAPTER ONE
Low water, at six.
CHAPTER TWO
-- nothing --
CHAPTER THREE
High water: 4.1 metres, at noon; the bus ran.
"""

TESTS = [
    function("The first chapters of Alice", call="chapter_lengths", args=("alice.txt",),
             expect=[2146, 2115, 1703, 2655, 2173, 2597, 2296, 2491, 2290, 2052, 1882, 2121], visible=True),
    function("A short log with an empty chapter", call="chapter_lengths", args=("log.txt",), files={"log.txt": LOG},
             expect=[4, 1, 9],
             hint="Count the words after each CHAPTER line, not the line itself, and nothing before the first one. A piece that's only punctuation, like --, isn't a word."),
]
