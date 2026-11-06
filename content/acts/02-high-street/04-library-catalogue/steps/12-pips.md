---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased: "Every word and its count, saved for Aaesha. Four lines, more or less."
  - riya.confused: "The file's got one word in it. Hatter. Can you look? I'm told there were others."
dialogue_after:
  - riya.surprised: "So w wipes the file every time it opens. And I opened it every time. Got it."
hints:
  nudge: "What does opening a file with \"w\" do to what's already in it? How many times does Riya's program open it?"
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
Riya's `save_counts` should write a header, then one row for each word, commonest first. Run it and look at what's in the file.

Fix it so `counts.csv` comes out like this:

```
word,times
tea,3
party,2
hatter,1
```
