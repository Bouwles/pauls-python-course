# The harbour noticeboard, to Agnes's requirements. All six of them.
rude_words = ["blasted", "flipping", "dratted"]
width = 40

# Ask for the text
title = input("Title? ")
notice = input("Notice? ")

# Tidy the spaces
title = title.strip()
notice = " ".join(notice.split())

# Change the case
title = title.upper()

# Cut it to fit
if len(title) > width:
    title = title[:width - 3] + "..."

# Replace what has to go
for word in rude_words:
    notice = notice.replace(word, "*" * len(word))

# Frame it and centre it
print("=" * width)
print(title.center(width))
print(notice)
print("=" * width)
