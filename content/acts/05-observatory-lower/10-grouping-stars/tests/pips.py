DIFFERENT = "If only this fails, check the starting centres for this seed: are they K different stars?"

TESTS = [
    output("Seed 11: four real groups", expect="Group sizes: [8, 7, 5, 4]\nInertia: 1542.4", visible=True,
           hint="Print the starting centres. How many different stars are among them?"),
    output("Three groups, seed 6", set_vars={"K": 3, "SEED": 6}, expect="Group sizes: [11, 8, 5]\nInertia: 4606.8",
           visible=True, hint=DIFFERENT),
    output("Five groups, seed 11", set_vars={"K": 5, "SEED": 11}, expect="Group sizes: [8, 5, 4, 4, 3]\nInertia: 1451.9", hint=DIFFERENT),
    output("Four groups, seed 20", set_vars={"SEED": 20}, expect="Group sizes: [8, 7, 5, 4]\nInertia: 1542.4", hint=DIFFERENT),
    output("Seed 2 still works", set_vars={"SEED": 2}, expect="Group sizes: [8, 7, 5, 4]\nInertia: 1542.4"),
]
