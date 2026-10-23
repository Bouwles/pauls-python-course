---
id: make
type: make
title: Make Bea's scaler
on_pass: { bea: "Fifteen hundred of flour, twenty-one of yeast. Same as my paper bag, without the bag." }
hints:
  nudge: "When should `scale` hand each line over: once it has worked out all of them, or as soon as it has worked out one?"
  plan:
    - Read the lines one at a time
    - Skip the notes
    - Turn each line into a tuple and hand it over
    - Scale each one as it's asked for
    - Ask for the batches, then print each line as it arrives
  shape: |
    def read_recipe(path):
        with open(path) as card:
            for line in card:
                line = line.___()
                if not line or line.startswith(___):
                    continue
                name, amount, unit = line.split(___)
                ___ name, int(amount), unit


    def scale(ingredients, batches):
        for name, amount, unit in ingredients:
            ___ name, amount * batches, unit


    if __name__ == "__main__":
        batches = int(input("Batches? "))
        for name, amount, unit in scale(read_recipe("recipe.txt"), batches):
            print(f"{name}: {amount} {unit}")
---
Write Bea's scaler from the subgoals in the file. `recipe.txt` is already on the workbench.

```
Batches? 3
flour: 1500 g
water: 1050 ml
yeast: 21 g
salt: 30 g
butter: 75 g
```

The checks also call `read_recipe` and `scale` on their own, with other recipes, so keep the asking and printing under `if __name__ == "__main__":`.

One check hands `scale` a list of ingredients that never ends and asks for the first few. A generator copes with that. A list doesn't.
