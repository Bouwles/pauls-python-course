rude_words = ["blasted", "flipping", "dratted"]
width = 40

title = input("Title? ").strip().upper()
notice = input("Notice? ")

if len(title) > width:
    title = title[:width - 3] + "..."

# Compare each word without its punctuation, in lower case
words = notice.split()
for i in range(len(words)):
    bare = words[i].strip(".,!?")
    if bare.lower() in rude_words:
        words[i] = words[i].replace(bare, "*" * len(bare))
notice = " ".join(words)

print("=" * width)
print(title.center(width))
print(notice)
print("=" * width)
