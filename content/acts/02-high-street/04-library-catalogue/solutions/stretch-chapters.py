# Mrs Vance's word counter, for the reading group.
import csv
import string
from collections import Counter
from pathlib import Path

# Words too common to tell you anything about a book.
SMALL_WORDS = {
    "a", "about", "all", "an", "and", "are", "as", "at", "be", "been", "but", "by",
    "can", "could", "did", "do", "for", "from", "had", "has", "have", "he", "her",
    "herself", "him", "his", "i", "if", "in", "into", "is", "it", "its", "just", "me",
    "my", "no", "not", "now", "of", "off", "on", "one", "or", "out", "over", "she",
    "so", "some", "than", "that", "the", "their", "them", "then", "there", "they",
    "this", "to", "too", "up", "very", "was", "we", "were", "what", "when", "which",
    "who", "will", "with", "would", "you", "your",
}


def read_words(path):
    """Every word in a text file, in order: punctuation off the ends, lower case."""
    words = []
    # Read inside with
    with open(path) as book:
        for piece in book.read().split():
            # Tidy each piece, and skip the empty ones
            word = piece.strip(string.punctuation).lower()
            if word:
                words.append(word)
    return words


def top_words(words, count=10):
    """The commonest words as (word, times) pairs, leaving out the small words."""
    top = []
    # Count with Counter
    for word, times in Counter(words).most_common():
        # Leave out the small words, and stop at count
        if word in SMALL_WORDS:
            continue
        if len(top) == count:
            break
        top.append((word, times))
    return top


def save_counts(words, path):
    """Write every different word and how many times it's used, commonest first."""
    with open(path, "w", newline="") as file:
        writer = csv.writer(file)
        # Write the header, then every row
        writer.writerow(["word", "times"])
        for word, times in Counter(words).most_common():
            writer.writerow([word, times])


def chapter_lengths(path):
    """How many words are in each chapter. A chapter starts at a line beginning CHAPTER."""
    lengths = []
    with open(path) as book:
        for line in book:
            if line.startswith("CHAPTER"):
                lengths.append(0)
                continue
            if lengths:
                for piece in line.split():
                    if piece.strip(string.punctuation):
                        lengths[-1] += 1
    return lengths


def main():
    # Ask which book
    name = input("Which book? ").strip()
    # No file: say so
    if not Path(name).exists():
        print(f"There's no book called {name}.")
        return
    words = read_words(name)
    if not words:
        print(f"{name} has no words in it.")
        return
    # The report, then save the counts
    print(f"Words: {len(words):,}")
    print(f"Different words: {len(set(words)):,}")
    print("Most common, leaving out the small words:")
    for rank, (word, times) in enumerate(top_words(words), start=1):
        print(f"{rank}. {word}: {times}")
    save_counts(words, "counts.csv")
    print("Every count is in counts.csv.")


if __name__ == "__main__":
    main()
