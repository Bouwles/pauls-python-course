import csv
import io


def saved_rows(ctx):
    result = ctx.run_program()
    text = result.files_out.get("counts.csv", "")
    rows = list(csv.reader(io.StringIO(text)))
    wanted = [["word", "times"], ["tea", "3"], ["party", "2"], ["hatter", "1"]]
    if rows != wanted:
        raise CheckFailed("counts.csv should hold the header, then every word, commonest first.",
                          expected="word,times\ntea,3\nparty,2\nhatter,1", actual=text)


TESTS = [
    output("Three words, three rows", expect="word,times\ntea,3\nparty,2\nhatter,1", visible=True),
    custom("Every row is in counts.csv", saved_rows),
    output("A longer list", set_vars={"words": ["off", "with", "her", "head", "off", "off", "her"]},
           expect="word,times\noff,3\nher,2\nwith,1\nhead,1",
           hint="One open, before the loop. Then the header once, and a row for each word."),
]
