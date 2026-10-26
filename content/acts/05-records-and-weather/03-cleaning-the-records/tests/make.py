COLUMNS = ["name", "joined", "age", "parish", "launches"]

SMALL = """name,joined,age,parish,launches
Jory Pascoe,1931-05-04,24,Harbour,12
 jory pascoe,04/05/1931,24,harbour ,12
Wenna Kitto,07/08/1962,unknown,HILL,none
Tom Kitto ,9 Feb 1999,,Marsh,3
Tom Kitto,9 Feb 1999,,marsh,3
Ann Hollis,sometime in 1950,350,High Street,40
"""


def load(text):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(text))


def cleaned(ctx, text=None):
    import pandas as pd

    raw = load(ctx.files["register.csv"] if text is None else text)
    crew = ctx.module().clean_register(raw)
    if not isinstance(crew, pd.DataFrame):
        raise CheckFailed("clean_register should give back a DataFrame.", actual=type(crew).__name__)
    if list(crew.columns) != COLUMNS:
        raise CheckFailed("clean_register should keep the same five columns, in the same order.",
                          expected=str(COLUMNS), actual=str(list(crew.columns)))
    return crew


def is_date(value, year, month, day):
    import pandas as pd

    return not pd.isna(value) and (value.year, value.month, value.day) == (year, month, day)


def ashbys_register(ctx):
    import pandas as pd

    crew = cleaned(ctx)
    if len(crew) != 128:
        raise CheckFailed("Once cleaned, the register should have 128 crew, each of them once.", expected="128 rows", actual=f"{len(crew)} rows")
    if not crew.index.equals(pd.RangeIndex(len(crew))):
        raise CheckFailed("The rows should be labelled 0, 1, 2 and so on, with no gaps. reset_index(drop=True) does it.",
                          actual=str(crew.index.tolist()[:8]) + " ...")


def parsed(ctx, texts):
    import pandas as pd

    dates = ctx.module().parse_dates(pd.Series(texts))
    if not isinstance(dates, pd.Series) or not pd.api.types.is_datetime64_any_dtype(dates):
        raise CheckFailed("parse_dates should give back a Series of dates.", actual=repr(dates))
    return dates


def three_formats(ctx):
    dates = parsed(ctx, ["1987-10-06", "06/10/1987", "6 Oct 1987"])
    if not all(is_date(d, 1987, 10, 6) for d in dates):
        raise CheckFailed("All three are the sixth of October 1987.", expected="1987-10-06, three times", actual=", ".join(str(d)[:10] for d in dates))


def unreadable(ctx):
    import pandas as pd

    dates = parsed(ctx, ["sometime in 1950", "1950-13-40", "2001-02-03"])
    if not (pd.isna(dates.iloc[0]) and pd.isna(dates.iloc[1]) and is_date(dates.iloc[2], 2001, 2, 3)):
        raise CheckFailed("A date that fits none of the formats should be left missing, as NaT.",
                          expected="NaT, NaT, 2001-02-03", actual=", ".join(str(d)[:10] for d in dates))


def tidy_text(ctx):
    crew = cleaned(ctx)
    parishes = set(crew["parish"])
    if parishes != {"Harbour", "High Street", "Hill", "Marsh"}:
        raise CheckFailed("The parish column should hold just four names.", expected="Harbour, High Street, Hill, Marsh",
                          actual=", ".join(sorted(map(repr, parishes))))
    untidy = [name for name in crew["name"] if name != name.strip().title()]
    if untidy:
        raise CheckFailed("Some names still have spaces at the ends, or the wrong capitals.", actual=repr(untidy[:4]))


def ages(ctx):
    import pandas as pd

    crew = cleaned(ctx)
    if not pd.api.types.is_numeric_dtype(crew["age"]):
        raise CheckFailed("age should be a column of numbers.", actual=str(crew["age"].dtype))
    if crew["age"].max() > 100:
        raise CheckFailed("Ages over 100 are typing mistakes, and should be missing.", actual=f"largest age {crew['age'].max()}")
    missing = int(crew["age"].isna().sum())
    if missing != 20:
        raise CheckFailed("Twenty ages should be missing: the blanks, the unknowns and the 412.", expected="20", actual=str(missing))
    if abs(crew["age"].mean() - 26.463) > 0.01:
        raise CheckFailed("The average of the known ages should be about 26.5.", expected="26.46", actual=f"{crew['age'].mean():.2f}")


def launches(ctx):
    import pandas as pd

    crew = cleaned(ctx)
    if not pd.api.types.is_integer_dtype(crew["launches"]):
        raise CheckFailed("launches should be whole numbers.", actual=str(crew["launches"].dtype))
    if int((crew["launches"] == 0).sum()) != 2 or int(crew["launches"].sum()) != 7860:
        raise CheckFailed("Every launch should be counted, with none as 0.", expected="2 crew on 0, 7860 launches in all",
                          actual=f"{int((crew['launches'] == 0).sum())} on 0, {int(crew['launches'].sum())} in all")


def joined(ctx):
    import pandas as pd

    crew = cleaned(ctx)
    if not pd.api.types.is_datetime64_any_dtype(crew["joined"]):
        raise CheckFailed("joined should be a column of dates.", actual=str(crew["joined"].dtype))
    missing = int(crew["joined"].isna().sum())
    if missing != 1:
        raise CheckFailed("Exactly one date can't be read: it was left blank.", expected="1", actual=str(missing))
    jago = crew[crew["name"] == "Peter Jago"]["joined"]
    if len(jago) != 1 or not is_date(jago.iloc[0], 1960, 1, 9):
        raise CheckFailed("Peter Jago joined on the ninth of January 1960.", expected="1960-01-09", actual=str(jago.tolist()))


def each_once(ctx):
    crew = cleaned(ctx)
    repeated = sorted(set(crew[crew["name"].duplicated()]["name"]))
    if repeated:
        raise CheckFailed("Some crew are still in the register twice.", actual=", ".join(repeated))


def smaller(ctx):
    import math

    import pandas as pd

    crew = cleaned(ctx, SMALL).sort_values("name").reset_index(drop=True)
    names = crew["name"].tolist()
    if names != ["Ann Hollis", "Jory Pascoe", "Tom Kitto", "Wenna Kitto"]:
        raise CheckFailed("A smaller register of six rows should clean down to four crew.",
                          expected="['Ann Hollis', 'Jory Pascoe', 'Tom Kitto', 'Wenna Kitto']", actual=repr(names))
    if crew["parish"].tolist() != ["High Street", "Harbour", "Marsh", "Hill"]:
        raise CheckFailed("The parishes in the smaller register aren't tidy.", actual=repr(crew["parish"].tolist()))
    got_ages = ["missing" if math.isnan(a) else a for a in crew["age"]]
    if got_ages != ["missing", 24.0, "missing", "missing"]:
        raise CheckFailed("Ages: 350 and unknown and a blank should all be missing.", expected="['missing', 24.0, 'missing', 'missing']", actual=repr(got_ages))
    if [int(n) for n in crew["launches"]] != [40, 12, 3, 0]:
        raise CheckFailed("Launches in the smaller register are wrong.", expected="[40, 12, 3, 0]", actual=repr(crew["launches"].tolist()))
    dates = crew["joined"].tolist()
    if not (pd.isna(dates[0]) and is_date(dates[1], 1931, 5, 4) and is_date(dates[2], 1999, 2, 9) and is_date(dates[3], 1962, 8, 7)):
        raise CheckFailed("Dates in the smaller register are wrong.", expected="NaT, 1931-05-04, 1999-02-09, 1962-08-07",
                          actual=", ".join(str(d)[:10] for d in dates))


def raw_untouched(ctx):
    raw = load(ctx.files["register.csv"])
    before = raw.copy()
    ctx.module().clean_register(raw)
    if not raw.equals(before):
        raise CheckFailed("clean_register changed the raw table it was given. Mr Ashby never writes on an original.")


def step_on(ctx, name, table):
    import pandas as pd

    before = table.copy()
    result = getattr(ctx.module(), name)(table)
    if not isinstance(result, pd.DataFrame):
        raise CheckFailed(f"{name} should give back a DataFrame.", actual=type(result).__name__)
    if not table.equals(before):
        raise CheckFailed(f"{name} changed the table it was given. Each step works on a copy and gives the copy back.")
    return result


def step_tidy(ctx):
    table = load(SMALL)
    result = step_on(ctx, "tidy_text", table)
    if result["name"].tolist()[:2] != ["Jory Pascoe", "Jory Pascoe"] or result["parish"].tolist()[2] != "Hill":
        raise CheckFailed("tidy_text should strip and title-case the names and parishes.",
                          expected="['Jory Pascoe', 'Jory Pascoe', ...], parish 'Hill'", actual=repr(result["name"].tolist()[:2]))
    if result["joined"].tolist() != table["joined"].tolist():
        raise CheckFailed("tidy_text should leave the other columns alone: the dates are another step's job.")


def step_dates(ctx):
    import pandas as pd

    result = step_on(ctx, "read_dates", load(SMALL))
    if not pd.api.types.is_datetime64_any_dtype(result["joined"]):
        raise CheckFailed("read_dates should turn the joined column into dates.", actual=str(result["joined"].dtype))
    if not (is_date(result["joined"].iloc[1], 1931, 5, 4) and pd.isna(result["joined"].iloc[5])):
        raise CheckFailed("read_dates should read all three formats and leave the rest missing.",
                          expected="1931-05-04 for the second row, NaT for 'sometime in 1950'",
                          actual=", ".join(str(d)[:10] for d in result["joined"]))


def step_numbers(ctx):
    import pandas as pd

    result = step_on(ctx, "make_numbers", load(SMALL))
    if not pd.api.types.is_numeric_dtype(result["age"]) or not pd.api.types.is_integer_dtype(result["launches"]):
        raise CheckFailed("make_numbers should make age a column of numbers and launches whole numbers.",
                          actual=f"age {result['age'].dtype}, launches {result['launches'].dtype}")
    if [int(n) for n in result["launches"]] != [12, 12, 0, 3, 3, 40]:
        raise CheckFailed("Launches: none counts as 0.", expected="[12, 12, 0, 3, 3, 40]", actual=repr(result["launches"].tolist()))


def step_impossible(ctx):
    import math

    import numpy as np
    import pandas as pd

    table = pd.DataFrame({"name": ["Samuel Vosper", "Walter Kerrow", "Ann Hollis"], "age": [412.0, 19.0, np.nan]})
    result = step_on(ctx, "drop_impossible", table)
    ages = ["missing" if math.isnan(a) else a for a in result["age"]]
    if ages != ["missing", 19.0, "missing"]:
        raise CheckFailed("drop_impossible should make ages over 100 missing and keep the rest.", expected="['missing', 19.0, 'missing']", actual=repr(ages))


def step_duplicates(ctx):
    import pandas as pd

    table = pd.DataFrame({"name": ["Tom Kitto", "Ann Hollis", "Tom Kitto"], "launches": [3, 40, 3]})
    result = step_on(ctx, "drop_duplicates", table)
    if result["name"].tolist() != ["Tom Kitto", "Ann Hollis"] or not result.index.equals(pd.RangeIndex(2)):
        raise CheckFailed("drop_duplicates should keep each row once, labelled 0, 1, 2 again.",
                          expected="Tom Kitto, Ann Hollis, labelled 0 and 1", actual=f"{result['name'].tolist()}, labelled {result.index.tolist()}")


def runs_the_pipeline(ctx):
    module = ctx.module()
    expected = [module.tidy_text, module.read_dates, module.make_numbers, module.drop_impossible, module.drop_duplicates]
    if list(module.PIPELINE) != expected:
        raise CheckFailed("PIPELINE should list the five steps in Moss's order.")
    calls = []
    originals = list(module.PIPELINE)

    def recorder(step):
        def run(table):
            calls.append(step.__name__)
            return step(table)
        return run

    module.PIPELINE[:] = [recorder(step) for step in originals]
    try:
        module.clean_register(load(SMALL))
    finally:
        module.PIPELINE[:] = originals
    if calls != [step.__name__ for step in originals]:
        raise CheckFailed("clean_register should run every step in PIPELINE, once each, in order.",
                          expected=str([step.__name__ for step in originals]), actual=str(calls))


TESTS = [
    custom("Ashby's register: 128 crew, labelled from 0", ashbys_register, visible=True),
    custom("Dates written all three ways", three_formats, visible=True,
           hint="Don't let pandas guess the format. Try each of DATE_FORMATS in turn, with errors=\"coerce\", and fill the gaps with fillna."),
    custom("A date nobody can read", unreadable,
           hint="errors=\"coerce\" turns a date that doesn't fit into NaT instead of stopping with an error."),
    custom("Names and parishes tidied", tidy_text, hint="Strip the spaces off both ends, then title-case: .str.strip().str.title()."),
    custom("Ages are numbers, and the impossible ones are gone", ages,
           hint="pd.to_numeric with errors=\"coerce\" makes unknown missing. Then use .loc to make any age over 100 missing too."),
    custom("Launches are whole numbers", launches, hint="none means nobody launched yet: replace it with \"0\" before turning the column into numbers."),
    custom("Joined is a date", joined),
    custom("Each crew member once", each_once,
           hint="Drop duplicates after the cleaning. Before it, a stray space or a different date format makes two copies look different."),
    custom("A smaller register", smaller,
           hint="Clean whatever register you're given. Nothing about Ashby's should be written in."),
    custom("The raw register is left as it was", raw_untouched,
           hint="Start each step with clean = register.copy(), and change only the copy."),
    custom("Step one: tidy_text", step_tidy, hint="Strip and title-case name and parish, on a copy, and touch nothing else."),
    custom("Step two: read_dates", step_dates, hint="read_dates puts parse_dates to work on the joined column of a copy."),
    custom("Step three: make_numbers", step_numbers),
    custom("Step four: drop_impossible", step_impossible,
           hint="Only ages over 100 go. A missing age stays missing, and 19 stays 19."),
    custom("Step five: drop_duplicates", step_duplicates),
    custom("clean_register runs the pipeline", runs_the_pipeline,
           hint="Loop over PIPELINE, handing each step what the last one gave back. Don't call the steps by name."),
]
