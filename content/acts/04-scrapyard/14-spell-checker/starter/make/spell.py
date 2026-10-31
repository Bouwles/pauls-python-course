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
    # Fill the rest, row by row
    # The answer is in the last slot


def suggest(word, counts, limit=3):
    """Up to limit known words within MOST_CHANGES of word: fewest changes, then most common, then A to Z."""


def check(text, counts):
    """(word, suggestions) for each word in text the list doesn't know, in order, each word once."""


def mark(given, correct):
    """'right', 'near enough' or 'wrong', ignoring capitals and spaces at either end."""


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
