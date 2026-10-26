---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I've saved every word and its count. Done in four lines, more or less."
  - pip: "The file's got one word in it. Hatter. I'm told there were others."
dialogue_after:
  - pip: "So w wipes it every time I open it. I opened it every time. Fair enough."
hints:
  nudge: "What does opening a file with \"w\" do to what's already in it? How many times does Pip's program open it?"
  plan:
    - Run it and count the rows
    - Open the file once, before the loop
    - Write the header once, then a row for each word
  shape: |
    def save_counts(counts, path):
        with open(path, "w", newline="") as file:
            writer = csv.writer(file)
            writer.___(["word", "times"])
            for word, times in counts.most_common():
                writer.writerow(___)
---
Pip's `save_counts` should write a header, then one row for each word, commonest first. Run it.

Files open in three main modes: `"r"` reads (the default), `"w"` writes, and `"a"` appends. Fix it so `counts.csv` comes out like this:

```
word,times
tea,3
party,2
hatter,1
```
