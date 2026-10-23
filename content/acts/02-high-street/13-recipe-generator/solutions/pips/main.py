def scale(recipe, batches):
    for name, grams in recipe:
        yield name, grams * batches


recipe = [("flour", 300), ("butter", 200), ("sugar", 100)]
batches = 3

scaled = list(scale(recipe, batches))
for name, grams in scaled:
    print(f"{name}: {grams} g")
total = sum(grams for name, grams in scaled)
print(f"Total: {total} g")
