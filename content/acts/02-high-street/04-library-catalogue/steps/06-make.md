---
id: make
type: make
title: Make the word counter
files: [words.py]
entry: words.py
timeout_ms: 15000
on_pass: { aaesha.pleased: "Two thousand six hundred and sixty-nine different words, and one row for each. Not a duplicate among them." }
hints:
  nudge: "Before anything is counted, what has to happen to `\"Alice,` so that it counts as `alice`?"
  plan:
    - Read inside with
    - Tidy each piece, and skip the empty ones
    - Count with Counter
    - Leave out the small words, and stop at count
    - Write the header, then every row
    - "No file: say so"
    - The report, then save the counts
  shape: |
    def read_words(path):
        words = []
        with open(path) as book:
            for piece in book.read().___():
                word = piece.strip(___).lower()
                if word:
                    words.append(word)
        return words


    def top_words(words, count=10):
        top = []
        for word, times in Counter(words).___():
            if word in SMALL_WORDS:
                continue
            if len(top) == ___:
                break
            top.append((word, times))
        return top


    def main():
        name = input("Which book? ").strip()
        if not Path(name).___():
            print(f"There's no book called {name}.")
            return
        ...
        for rank, (word, times) in enumerate(top_words(words), start=___):
            print(f"{rank}. {word}: {times}")
---
Write the three functions and `main` in `words.py`. The comments are Paul's subgoals from his repair book.

```
Which book? alice.txt
Words: 26,628
Different words: 2,669
Most common, leaving out the small words:
1. said: 462
2. alice: 386
...
10. time: 68
Every count is in counts.csv.
```

`f"{len(words):,}"` puts the commas in 26,628. "Different words" counts every different word, small ones included: a set is one way.

The checks call your functions with other words and other files, and open `counts.csv` after `main` has run. Aaesha will too.
