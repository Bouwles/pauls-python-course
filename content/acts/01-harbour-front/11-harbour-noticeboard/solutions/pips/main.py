rude_words = ["blasted", "flipping", "dratted"]

notice = input("Notice? ")
for word in rude_words:
    notice = notice.replace(word, "*" * len(word))
print(notice)
