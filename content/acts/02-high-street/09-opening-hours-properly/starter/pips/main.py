import crates

deliveries = {"postcards": 130, "posters": 45, "badges": 90}
PER_CRATE = 40

for product, items in deliveries.items():
    crates = crates.crates_needed(items, PER_CRATE)
    print(f"{product}: {crates} crates")
