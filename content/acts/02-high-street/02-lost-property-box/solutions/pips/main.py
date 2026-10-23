def repeats(items):
    seen = set()
    repeated = set()
    for item in items:
        if item in seen:
            repeated.add(item)
        seen.add(item)
    return repeated


handed_in = ["red scarf", "umbrella", "red scarf", "glove", "umbrella", "red scarf"]
print(sorted(repeats(handed_in)))
