"""Spell Checker: finds the words it doesn't know, and suggests the nearest ones it does."""
import re

WORDS_FILE = "words.csv"
MOST_CHANGES = 2

# Three disputed answers from Paul's end-of-term quiz: what was written, and what was right.
DISPUTED = [("Copenhagan", "Copenhagen"), ("Kito", "Quito"), ("Copenahgen", "Copenhagen")]


def load_counts(path):
    """Every word in the word list, and how many times it turned up in the books."""
    counts = {}
    with open(path) as words_file:
        next(words_file)
        for line in words_file:
            word, count = line.strip().split(",")
            counts[word] = int(count)
    return counts


def words_in(text):
    """The words in text, in lower case: letters, with apostrophes inside them."""
    return re.findall(r"[a-z]+(?:'[a-z]+)*", text.lower())


def edit_distance(given, correct):
    """The fewest letters put in, taken out or swapped to turn given into correct."""
    # The edges: turning some letters into none, or none into some
    table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
    for row in range(len(given) + 1):
        table[row][0] = row
    for col in range(len(correct) + 1):
        table[0][col] = col
    # Fill the rest, row by row
    for row in range(1, len(given) + 1):
        for col in range(1, len(correct) + 1):
            if given[row - 1] == correct[col - 1]:
                table[row][col] = table[row - 1][col - 1]
            else:
                table[row][col] = 1 + min(table[row - 1][col], table[row][col - 1], table[row - 1][col - 1])
    # The answer is in the last slot
    return table[len(given)][len(correct)]


def suggest(word, counts, limit=3):
    """Up to limit known words within MOST_CHANGES of word: fewest changes, then most common, then A to Z."""
    nearby = []
    for known, count in counts.items():
        # A word three letters longer is at least three changes away: don't work it out
        if abs(len(known) - len(word)) > MOST_CHANGES:
            continue
        changes = edit_distance(word, known)
        if changes <= MOST_CHANGES:
            nearby.append((changes, -count, known))
    nearby.sort()
    return [known for _, _, known in nearby[:limit]]


def check(text, counts):
    """(word, suggestions) for each word in text the list doesn't know, in order, each word once."""
    unknown = []
    for word in words_in(text):
        if word not in counts and word not in [found for found, _ in unknown]:
            unknown.append((word, suggest(word, counts)))
    return unknown


def mark(given, correct):
    """'right', 'near enough' or 'wrong', ignoring capitals and spaces at either end."""
    given = given.strip().lower()
    correct = correct.strip().lower()
    if given == correct:
        return "right"
    if edit_distance(given, correct) <= len(correct) // 5:
        return "near enough"
    return "wrong"


if __name__ == "__main__":
    counts = load_counts(WORDS_FILE)
    print(f"Knows {len(counts)} words.")
    for given, correct in DISPUTED:
        print(f"'{given}' for '{correct}': {mark(given, correct)}")
    while True:
        text = input("Check? ")
        if not text.strip():
            break
        unknown = check(text, counts)
        if not unknown:
            print("Every word known.")
        for word, suggestions in unknown:
            print(f"  {word}: {', '.join(suggestions) if suggestions else 'nothing near'}")
