# Bea's recipe scaler.

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


if __name__ == "__main__":
    batches = int(input("Batches? "))
    for name, amount, unit in scale(read_recipe("recipe.txt"), batches):
        print(f"{name}: {amount} {unit}")
