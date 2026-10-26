sizes = [(112, 98, 84), (96, 88, 74), (101, 95, 79)]


def chest_range(sizes):
    smallest = sizes[0][0]
    largest = sizes[0][0]
    for chest, waist, leg in sizes:
        if chest < smallest:
            smallest = chest
        if chest > largest:
            largest = chest
    return smallest
    return largest


low, high = chest_range(sizes)
print(f"Chests run from {low} to {high} cm.")
