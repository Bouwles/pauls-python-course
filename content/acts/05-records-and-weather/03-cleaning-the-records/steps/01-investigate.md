---
id: investigate
type: investigate
title: Three volunteers
concept: data-cleaning
dialogue:
  - aaesha: "One volunteer per thirty years. They never met. You can tell."
code: |
  import pandas as pd

  raw = pd.read_csv("register.csv")

  print(raw.shape)
  print(raw.dtypes)
  print(raw.iloc[[0, 40, 90]])
  print(raw["parish"].unique())
  print(raw.isna().sum())
  print(raw.duplicated().sum())
tasks:
  - id: age-type
    prompt: "Run it. What dtype has pandas given the `age` column?"
    kind: answer
    accept: ["str", "object", "string", "text", "<class 'str'>"]
    feedback: "`str`: text. One `unknown` and pandas can't treat any of the column as numbers. `launches` is text too, because of the word `none`."
    wrong: "Look down the list of dtypes, next to `age`."
  - id: harbour
    prompt: "How many different ways is the parish of Bankside written?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three: `Bankside`, `bankside`, and `BANKSIDE ` with a space on the end. To pandas, those are three different parishes."
    wrong: "Count the versions of Bankside in the `unique()` list, spaces included."
  - id: missing-ages
    prompt: "`raw.isna()` marks every missing value. How many ages are missing?"
    kind: answer
    accept: ["12", "twelve"]
    feedback: "Twelve blanks. That isn't all of them: `unknown` isn't missing to pandas, it's just a word. And one man apparently joined at 412."
    wrong: "Read the `age` line of the `isna().sum()` output."
  - id: duplicates
    prompt: "`raw.duplicated()` marks each row that exactly matches an earlier one. How many are there?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three exact copies. Aaesha knows of more: the others differ by a space, a capital or a date format, so they don't match yet."
    wrong: "It's the last number printed."
  - id: tidy-parish
    prompt: "Tidy the parishes. Before the `unique()` line, assign `raw[\"parish\"].str.strip().str.title()` back to `raw[\"parish\"]`. There should be four parishes left."
    kind: run
    tests: |
      def four_parishes(ctx):
          raw = ctx.module().raw
          found = set(raw["parish"])
          if found != {"Bankside", "Church Street", "Hill", "Northgate"}:
              raise CheckFailed("The parish column should hold just four names once it's tidied.",
                                expected="Bankside, Church Street, Hill, Northgate", actual=", ".join(sorted(map(repr, found))))


      TESTS = [custom("Four parishes", four_parishes)]
    solution: |
      import pandas as pd

      raw = pd.read_csv("register.csv")

      print(raw.shape)
      print(raw.dtypes)
      print(raw.iloc[[0, 40, 90]])
      raw["parish"] = raw["parish"].str.strip().str.title()
      print(raw["parish"].unique())
      print(raw.isna().sum())
      print(raw.duplicated().sum())
---
This is the river rescue crew register as the volunteers left it. The first typed 1925 to 1959, the second 1960 to 1989, the third everything since.

`raw.iloc[[0, 40, 90]]` shows one row from each of them. `.str` gives a text column the string methods you know, applied to every value at once: `.str.strip()`, `.str.lower()`, `.str.title()`.

Run it, then answer the questions.
