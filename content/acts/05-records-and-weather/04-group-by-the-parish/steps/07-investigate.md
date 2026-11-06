---
id: investigate
type: investigate
title: The census, in piles
concept: groupby
code: |
  import pandas as pd

  census = pd.read_csv("census.csv")

  by_year = census.groupby("year")
  print(by_year.size())
  print(by_year["age"].mean().round(1))

  print(census.groupby(["year", "parish"]).size().head(8))

  by_parish = census.groupby("parish").agg(
      people=("name", "size"),
      oldest=("age", "max"),
      trades=("occupation", "nunique"),
  )
  print(by_parish)

  ages = census.pivot_table(index="parish", columns="year", values="age", aggfunc="mean")
  print(ages.round(1))
tasks:
  - id: youngest
    prompt: "Run it. In which census year were the streets youngest, on average?"
    kind: answer
    accept: ["1951", "in 1951"]
    feedback: "1951, at 25.3. The children of the 1940s are in it, and a good many of them were under five."
    wrong: "Look at the second block: one average age for each year."
  - id: hill-1951
    prompt: "Grouping by a list of two columns makes one group for each pair. How many people lived on the Hill in 1951?"
    kind: answer
    accept: ["18", "eighteen"]
    feedback: "18. The pairs are shown as two levels of labels, year on the outside and parish inside."
    wrong: "Find 1951 in the third block, then the Hill inside it."
  - id: oldest-harbour
    prompt: "`agg` makes several named summaries at once, each from a column and a calculation. Whose age is the 121 in Bankside's `oldest`?"
    kind: answer
    accept: ["Albert Moyle", "Moyle", "Albert Moyle, in 2011", "Albert Moyle in 2011", "Albert Moyle, 2011"]
    feedback: "Albert Moyle, in 2011. A record, or a typo. The cleaning pipeline would have made that age missing."
    wrong: "Filter the census for an age of 121 and print the name."
  - id: harbour-1981
    prompt: "A pivot table lays groups out as a grid: `index` down the side, `columns` across the top, `aggfunc` in each cell. What was the average age in Bankside in 1981?"
    kind: answer
    accept: ["50.2", "50.2 years"]
    feedback: "50.2. Bankside got old between 1951 and 1981, and then younger again."
    wrong: "Read the last table: Bankside's row, the 1981 column."
  - id: count-instead
    prompt: "Change the last pivot table so each cell counts the people in that parish that year, instead of averaging their ages."
    kind: run
    tests: |
      def counts(ctx):
          import pandas as pd

          ages = ctx.module().ages
          if not isinstance(ages, pd.DataFrame):
              raise CheckFailed("ages should still be a table.", actual=type(ages).__name__)
          try:
              cells = [int(ages.loc["Bankside", 1921]), int(ages.loc["Hill", 1951]), int(ages.loc["Northgate", 2011])]
          except (KeyError, ValueError):
              raise CheckFailed("Keep parishes down the side and years across the top.")
          if cells != [29, 18, 13]:
              raise CheckFailed("Each cell should be a number of people: Bankside in 1921, Hill in 1951, Northgate in 2011.",
                                expected="[29, 18, 13]", actual=str(cells))


      TESTS = [custom("People in each parish in each year", counts)]
    solution: |
      import pandas as pd

      census = pd.read_csv("census.csv")

      by_year = census.groupby("year")
      print(by_year.size())
      print(by_year["age"].mean().round(1))

      print(census.groupby(["year", "parish"]).size().head(8))

      by_parish = census.groupby("parish").agg(
          people=("name", "size"),
          oldest=("age", "max"),
          trades=("occupation", "nunique"),
      )
      print(by_parish)

      ages = census.pivot_table(index="parish", columns="year", values="age", aggfunc="size")
      print(ages)
---
The whole census, asked four ways: by year, by year and parish, by parish with `agg`, and as a pivot table.
