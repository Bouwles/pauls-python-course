---
id: make-clean
type: make
title: The station book, cleaned
files: [station.py]
entry: station.py
timeout_ms: 20000
dialogue:
  - yahya.unimpressed: "The station book, as the volunteers typed it. Fahrenheit until 1960, as it was written."
  - yahya.worried: "The 1987 pages got soaked in the October storm. They were typed up last."
on_pass: { yahya.pleased.thumbs: "Twelve hundred months, each once, each in Celsius. The ledger can go back in its cabinet." }
hints:
  nudge: "Which rows need converting, and how would you know if the unit were written `f` or `F `? And when can `drop_duplicates()` see that two rows are the same month?"
  plan:
    - Read every column as text first
    - Split the month into whole-number years and months
    - Make the numbers numbers, with away as missing
    - Convert the Fahrenheit rows, rounded to one decimal
    - Drop the duplicates, last, then put the months in order
    - For missing_months, count from the first month to the last
  shape: |
    def load_station(path):
        raw = pd.read_csv(path, dtype=str)
        parts = raw["month"].str.strip().str.split("-", expand=___)
        station = pd.DataFrame({"year": parts[0].astype(int), "month": ___})
        temp = pd.to_numeric(raw["temp"])
        station["rain"] = ___
        station["sun"] = pd.to_numeric(raw["sun"], errors=___)
        fahrenheit = raw["unit"].str.___().str.___() == "F"
        station["temp"] = temp.where(~fahrenheit, to_celsius(temp).___(1))
        station = station[["year", "month", "temp", "rain", "sun"]].___()
        return station.sort_values([___, ___]).reset_index(drop=___)
---
`station.py` turns `ledger.csv` into a station book Yahya can trust. The requirements are at the top of the file.

`str.split(..., expand=True)` and `where` are from "Keep it, or take it from elsewhere"; everything else is from the cleaning pipeline.

Try it as you go with a few lines under `if __name__ == "__main__":`. The checks don't run them.

The hidden checks clean the whole century, then a small ledger of their own, with months written `2001-1`, units written ` f`, and a month typed twice.
