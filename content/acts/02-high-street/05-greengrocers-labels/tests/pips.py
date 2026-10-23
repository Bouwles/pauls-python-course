TESTS = [
    output("Sanjay's stock", expect="Reorder: pears, leeks, kale", visible=True,
           hint="An if that decides which items to keep goes at the end, after the for."),
    output("Another week's stock", set_vars={"stock": [("figs", 90, 3), ("swedes", 70, 10), ("dates", 120, 0)]},
           expect="Reorder: figs, dates",
           hint="Fewer than 10 means 9 or less. Swedes, with exactly 10, stay off the list."),
    structure("Still a comprehension", requires=["ListComp"],
              message="Keep it as a list comprehension: move the if, don't swap it for a loop."),
]
