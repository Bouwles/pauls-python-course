NONE_YET = "No expenses yet."
WRONG = "Choose 1 to 5."
REFUSED = "That's not an amount."


def afternoon(*steps):
    """Each step is a menu choice, and for 1, what it was for, the category and the amount."""
    inputs = []
    for step in steps:
        inputs.extend(step.split("|"))
    return inputs


SNACKS = {"item": "snacks", "category": "food", "amount": 18.4}
SANDWICHES = {"item": "sandwiches", "category": "food", "amount": 24.5}
TRAIN = {"item": "train tickets", "category": "travel", "amount": 60.0}
COACH = {"item": "coach hire", "category": "travel", "amount": 212.0}
MUSEUM = {"item": "museum entry", "category": "tickets", "amount": 60.0}

TESTS = [
    output("Add two, list them, total them",
           inputs=afternoon("1|snacks|Food|18.40", "1|coach hire|travel|212", "2", "3", "5"),
           expect="Added snacks.\nAdded coach hire.\n"
                  "snacks: 18.40 (food)\ncoach hire: 212.00 (travel)\n"
                  "food: 18.40\ntravel: 212.00\nTotal: 230.40\n"
                  "2 expenses, 230.40 in all.",
           visible=True),
    output("A quiet afternoon", inputs=["2", "3", "4", "5"],
           expect=NONE_YET + "\n" + NONE_YET + "\n" + NONE_YET + "\n0 expenses, 0.00 in all.",
           visible=True),
    function("category_totals of three receipts", call="category_totals", args=([SNACKS, SANDWICHES, TRAIN],),
             expect={"food": 42.9, "travel": 60.0}, tol=0.005,
             hint="Start with an empty dictionary. For each expense, add its amount to its category's total, starting from 0 with .get(category, 0)."),
    function("category_totals of nothing", call="category_totals", args=([],), expect={},
             hint="No expenses, no categories: an empty dictionary."),
    function("biggest of four receipts", call="biggest", args=([SNACKS, COACH, SANDWICHES, TRAIN],), expect=COACH,
             hint="biggest returns the whole dictionary of the largest expense, not just its amount."),
    function("biggest with a tie", call="biggest", args=([SNACKS, TRAIN, MUSEUM],), expect=TRAIN,
             hint="The train tickets and the museum entry are both 60.00. The one added first wins, so only replace the biggest when an amount is strictly bigger."),
    function("biggest of nothing", call="biggest", args=([],), expect=None,
             hint="An empty list has no biggest expense. Return None before looking at expenses[0]."),
    output("Amounts that aren't amounts",
           inputs=afternoon("1|sandwiches|food|twenty", "1|crisps|food|0", "1|refund|travel|-5", "1|water|food|", "2", "5"),
           expect="\n".join([REFUSED] * 4) + "\n" + NONE_YET + "\n0 expenses, 0.00 in all.",
           hint="A word, nothing at all, 0 and anything below 0 are all refused, and nothing is added."),
    output("Tidy categories",
           inputs=afternoon("1| snacks |Food |18.4", "1|sandwiches| food|24.5", "1|train tickets|TRAVEL|60", "3", "5"),
           expect="Added snacks.\nAdded sandwiches.\nAdded train tickets.\n"
                  "food: 42.90\ntravel: 60.00\nTotal: 102.90\n3 expenses, 102.90 in all.",
           hint="Strip spaces off what's typed and lower the category, so Food and food add up together."),
    output("Totals in alphabetical order",
           inputs=afternoon("1|train tickets|travel|60", "1|snacks|food|18.4", "1|museum entry|tickets|85", "1|bowling|activities|41.25", "3", "5"),
           expect="Added train tickets.\nAdded snacks.\nAdded museum entry.\nAdded bowling.\n"
                  "activities: 41.25\nfood: 18.40\ntickets: 85.00\ntravel: 60.00\nTotal: 204.65\n"
                  "4 expenses, 204.65 in all.",
           hint="Categories come out alphabetically, whatever order they went in. sorted() on the totals dictionary gives its keys in order."),
    output("The list keeps the order they were added",
           inputs=afternoon("1|coach hire|travel|212", "1|snacks|food|18.4", "1|fruit|food|3.2", "2", "5"),
           expect="Added coach hire.\nAdded snacks.\nAdded fruit.\n"
                  "coach hire: 212.00 (travel)\nsnacks: 18.40 (food)\nfruit: 3.20 (food)\n"
                  "3 expenses, 233.60 in all.",
           hint="List shows the receipts in the order they were added, not sorted."),
    output("Biggest, then a bigger one",
           inputs=afternoon("1|train tickets|travel|60", "1|museum entry|tickets|60", "4", "1|coach hire|travel|212", "4", "5"),
           expect="Added train tickets.\nAdded museum entry.\nBiggest: train tickets, 60.00 (travel)\n"
                  "Added coach hire.\nBiggest: coach hire, 212.00 (travel)\n3 expenses, 332.00 in all.",
           hint="On a tie, the one added first is the biggest."),
    output("One expense", inputs=afternoon("1|snacks|food|18.4", "5"),
           expect="Added snacks.\n1 expense, 18.40 in all.",
           hint="One is 1 expense. Any other number is expenses."),
    output("Wrong choices of every kind", inputs=["", "6", "add", "0", "5"],
           expect="\n".join([WRONG] * 4) + "\n0 expenses, 0.00 in all.",
           hint="Anything that isn't 1 to 5 gets the same reply: blank lines and words too."),
    output("Choices with spaces round them", inputs=[" 1 ", "snacks", "food", "18.4", " 2", "5 "],
           expect="Added snacks.\nsnacks: 18.40 (food)\n1 expense, 18.40 in all.",
           hint="Tidy the menu choice too: spaces at the ends of anything don't count."),
    output("A long afternoon",
           inputs=afternoon("1|snacks|food|18.40", "4", "1|train tickets|travel|60", "7", "1|sandwiches|Food|24.5",
                            "1|coach hire|Travel|212", "1|crisps|food|nine", "3", "4", "2", "5"),
           expect="Added snacks.\nBiggest: snacks, 18.40 (food)\nAdded train tickets.\n" + WRONG + "\n"
                  "Added sandwiches.\nAdded coach hire.\n" + REFUSED + "\n"
                  "food: 42.90\ntravel: 272.00\nTotal: 314.90\n"
                  "Biggest: coach hire, 212.00 (travel)\n"
                  "snacks: 18.40 (food)\ntrain tickets: 60.00 (travel)\nsandwiches: 24.50 (food)\ncoach hire: 212.00 (travel)\n"
                  "4 expenses, 314.90 in all.",
           hint="Follow the afternoon through by hand, one choice at a time, and find the first line that differs."),
]
