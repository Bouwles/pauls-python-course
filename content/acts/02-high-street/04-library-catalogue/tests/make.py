import csv
import io
import string

ALICE_TOP = [("said", 462), ("alice", 386), ("little", 129), ("down", 103), ("know", 87),
             ("like", 85), ("went", 83), ("again", 83), ("thought", 74), ("time", 68)]
REPORT = "\n".join(
    ["Words: 26,628", "Different words: 2,669", "Most common, leaving out the small words:"]
    + [f"{rank}. {word}: {times}" for rank, (word, times) in enumerate(ALICE_TOP, start=1)]
    + ["Every count is in counts.csv."]
)

NOTE = "Tea? TEA! -- tea...\n'Off with her head!'\n\n"
TIDE = "High water, low water, high water again.\nThe tide comes in; the tide goes out.\n"
TIDE_REPORT = """Words: 15
Different words: 10
Most common, leaving out the small words:
1. water: 3
2. high: 2
3. tide: 2
4. low: 1
5. again: 1
6. comes: 1
7. goes: 1
Every count is in counts.csv."""


def alice_words():
    """The book's words, tidied the way the brief says, for handing to the learner's functions."""
    with open("alice.txt") as book:
        pieces = [piece.strip(string.punctuation).lower() for piece in book.read().split()]
    return [word for word in pieces if word]


def read_alice(ctx):
    module = ctx.module()
    words = module.read_words("alice.txt")
    if not isinstance(words, list):
        raise CheckFailed("read_words should return a list of words.", expected="a list", actual=repr(words)[:80])
    if words[:6] != ["alice's", "adventures", "in", "wonderland", "by", "lewis"] or len(words) != 26628:
        raise CheckFailed("read_words(\"alice.txt\") should give 26,628 words, starting alice's, adventures, in, wonderland.",
                          expected="26628 words: ['alice's', 'adventures', 'in', 'wonderland', 'by', 'lewis', ...]",
                          actual=f"{len(words)} words: {words[:6]}")


def alice_top(ctx):
    module = ctx.module()
    top = module.top_words(alice_words())
    if top != ALICE_TOP:
        raise CheckFailed("top_words of the whole book should give these ten.", expected=str(ALICE_TOP), actual=str(top))


def saved_counts(ctx):
    module = ctx.module()
    module.save_counts(["queen", "tarts", "queen", "knave", "tarts", "queen"], "trial.csv")
    with open("trial.csv", newline="") as file:
        rows = list(csv.reader(file))
    wanted = [["word", "times"], ["queen", "3"], ["tarts", "2"], ["knave", "1"]]
    if rows != wanted:
        raise CheckFailed("save_counts should write the header, then every different word, commonest first.",
                          expected="word,times\nqueen,3\ntarts,2\nknave,1", actual="\n".join(",".join(row) for row in rows))


def main_saves(ctx):
    result = ctx.run_program(inputs=["alice.txt"])
    text = result.files_out.get("counts.csv")
    if text is None:
        raise CheckFailed("After the report, main should save every count in counts.csv.", expected="counts.csv", actual="no counts.csv")
    rows = list(csv.reader(io.StringIO(text)))
    if len(rows) != 2670 or rows[:3] != [["word", "times"], ["the", "1646"], ["and", "868"]]:
        raise CheckFailed("counts.csv should have the header and 2,669 rows, the commonest first: the, 1646.",
                          expected="word,times\nthe,1646\nand,868\n... (2,670 lines)", actual="\n".join(text.splitlines()[:3]) + f"\n... ({len(rows)} lines)")


TESTS = [
    output("The report on Alice", inputs=["alice.txt"], expect=REPORT, visible=True),
    output("No such book", inputs=["alice.text"], expect="There's no book called alice.text.", visible=True,
           hint="Check that the file exists before you open it: Path(name).exists()."),
    function("read_words of a short note", call="read_words", args=("note.txt",), files={"note.txt": NOTE},
             expect=["tea", "tea", "tea", "off", "with", "her", "head"],
             hint="Strip string.punctuation from both ends of each piece and lower it. A piece that's all punctuation, like --, leaves nothing, and nothing isn't a word."),
    custom("read_words of the whole book", read_alice),
    function("read_words of an empty file", call="read_words", args=("empty.txt",), files={"empty.txt": "\n\n"}, expect=[]),
    function("top_words leaves out the small words", call="top_words",
             args=(["tea", "party", "tea", "the", "the", "the", "hatter", "tea", "party"], 2), expect=[("tea", 3), ("party", 2)],
             hint="the is in SMALL_WORDS, so it's skipped however common it is. The second argument is how many to give back."),
    function("top_words keeps ties in the order they turned up", call="top_words",
             args=(["dormouse", "hatter", "hatter", "dormouse", "march"], 3), expect=[("dormouse", 2), ("hatter", 2), ("march", 1)],
             hint="Counter's most_common keeps ties in the order they were first seen. Sorting them yourself by word changes that."),
    function("top_words with fewer than ten words", call="top_words", args=(["queen", "the", "queen"],), expect=[("queen", 2)]),
    function("top_words of nothing", call="top_words", args=([],), expect=[]),
    custom("top_words of the whole book", alice_top),
    custom("save_counts writes every row", saved_counts,
           hint="Open the file once with \"w\" and newline=\"\", write the header, then a row for each (word, times) from most_common()."),
    custom("main saves counts.csv", main_saves),
    output("Another book", inputs=["tide.txt"], files={"tide.txt": TIDE}, expect=TIDE_REPORT,
           hint="Fewer than ten words are left after the small ones go, so the list is shorter. Number them from 1."),
    output("A book with nothing in it", inputs=["empty.txt"], files={"empty.txt": "\n\n"}, expect="empty.txt has no words in it.",
           hint="If read_words gives an empty list, say so and stop, before the report."),
    output("Spaces round the name", inputs=["  alice.txt "], expect="Words: 26,628", match="contains",
           hint="Strip what's typed before you look for the file."),
]
