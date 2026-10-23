import crates

deliveries = {"apples": 130, "pears": 45, "kale": 90}
PER_CRATE = 40

for fruit, items in deliveries.items():
    needed = crates.crates_needed(items, PER_CRATE)
    print(f"{fruit}: {needed} crates")
