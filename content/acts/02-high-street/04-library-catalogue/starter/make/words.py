# Aaesha's word counter, for her reading experiment.
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
    # Read inside with
    # Tidy each piece, and skip the empty ones
    pass


def top_words(words, count=10):
    # Count with Counter
    # Leave out the small words, and stop at count
    pass


def save_counts(words, path):
    # Write the header, then every row
    pass


def main():
    # Ask which book
    # No file: say so
    # The report, then save the counts
    pass


if __name__ == "__main__":
    main()
