import csv
from collections import Counter

words = ["tea", "party", "tea", "hatter", "tea", "party"]


def save_counts(counts, path):
    for word, times in counts.most_common():
        with open(path, "w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["word", "times"])
            writer.writerow([word, times])


save_counts(Counter(words), "counts.csv")
with open("counts.csv") as file:
    print(file.read())
