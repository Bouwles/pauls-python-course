---
id: make
type: make
title: Make the spell checker
files: [spell.py]
entry: spell.py
on_pass: { paul.laughing.thumbs: "Captain for captin, and cap'n second. That'll be the pirates in Treasure Island." }
hints:
  nudge: "In the `edit_distance` table, what does the slot for the first `row` letters of one word and the first `col` letters of the other mean? And for `suggest`, what would you sort the nearby words by?"
  plan:
    - "edit_distance: the edges first, turning some letters into none, or none into some"
    - "Fill the rest row by row: matching letters copy up-left; otherwise 1 more than the smallest of up, left and up-left"
    - "suggest: every known word within two changes, as (changes, minus its count, the word); sort them; keep the first few words"
    - "check: each word of the text the list doesn't know, once, with its suggestions"
    - "mark: tidy both answers, then right, near enough, or wrong"
  shape: |
    def edit_distance(given, correct):
        table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
        for row in range(len(given) + 1):
            table[row][0] = ___
        for col in range(len(correct) + 1):
            table[0][col] = ___
        for row in range(1, len(given) + 1):
            for col in range(1, len(correct) + 1):
                if given[row - 1] == correct[col - 1]:
                    table[row][col] = ___
                else:
                    table[row][col] = 1 + min(___, ___, ___)
        return table[len(given)][len(correct)]


    def suggest(word, counts, limit=3):
        nearby = []
        for known, count in counts.items():
            changes = edit_distance(word, known)
            if changes <= MOST_CHANGES:
                nearby.append((___, ___, known))
        nearby.sort()
        return [known for _, _, known in nearby[:___]]
---
Write `edit_distance`, `suggest`, `check` and `mark` in `spell.py`. The word list loads itself, `words_in` splits a text into words, and the loop at the bottom is done.

```
'Copenhagan' for 'Copenhagen': near enough
'Kito' for 'Quito': wrong
Check? The captin sailed round the iland at nite.
  captin: captain, cap'n, cabin
```

`edit_distance` is "A table for two words", handing back the bottom-right slot.

`suggest` sorts tuples, as the heap did: `(changes, minus the count, the word)`, so fewest changes come first, then the commonest word, then the alphabet. It checks thousands of words, so skip any more than two letters longer or shorter, since they can't be close.

`mark` allows one change for every five letters of the right answer, rounded down: `len(correct) // 5`.

The hidden checks try empty words, words of sixty letters, ties in every order and capitals.
