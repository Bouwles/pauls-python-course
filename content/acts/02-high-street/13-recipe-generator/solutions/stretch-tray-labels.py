# Bea's recipe scaler, with tray labels.

def read_recipe(path):
    """Yield (name, amount, unit) for each ingredient line in the recipe."""
    with open(path) as card:
        for line in card:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            name, amount, unit = line.split(",")
            yield name, int(amount), unit


def scale(ingredients, batches):
    """Yield each ingredient with its amount multiplied by batches."""
    for name, amount, unit in ingredients:
        yield name, amount * batches, unit


def tray_labels():
    """Tray 1, Tray 2, and so on, for ever."""
    number = 1
    while True:
        yield f"Tray {number}"
        number += 1


if __name__ == "__main__":
    batches = int(input("Batches? "))
    for name, amount, unit in scale(read_recipe("recipe.txt"), batches):
        print(f"{name}: {amount} {unit}")
    for _, label in zip(range(batches), tray_labels()):
        print(label)
