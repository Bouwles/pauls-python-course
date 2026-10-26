NONE_YET = "No expenses yet."
WRONG = "Choose 1 to 5."
REFUSED = "That's not an amount."


def afternoon(*steps):
    """Each step is a menu choice, and for 1, what it was for, the category and the amount."""
    inputs = []
    for step in steps:
        inputs.extend(step.split("|"))
    return inputs


FLOUR = {"item": "flour", "category": "ingredients", "amount": 18.4}
BUTTER = {"item": "butter", "category": "ingredients", "amount": 24.5}
DIESEL = {"item": "diesel", "category": "van", "amount": 60.0}
INSURANCE = {"item": "van insurance", "category": "van", "amount": 212.0}
OVEN = {"item": "oven repair", "category": "bakery", "amount": 60.0}

TESTS = [
    output("Add two, list them, total them",
           inputs=afternoon("1|flour|Ingredients|18.40", "1|van insurance|van|212", "2", "3", "5"),
           expect="Added flour.\nAdded van insurance.\n"
                  "flour: 18.40 (ingredients)\nvan insurance: 212.00 (van)\n"
                  "ingredients: 18.40\nvan: 212.00\nTotal: 230.40\n"
                  "2 expenses, 230.40 in all.",
           visible=True),
    output("A quiet afternoon", inputs=["2", "3", "4", "5"],
           expect=NONE_YET + "\n" + NONE_YET + "\n" + NONE_YET + "\n0 expenses, 0.00 in all.",
           visible=True),
    function("category_totals of three receipts", call="category_totals", args=([FLOUR, BUTTER, DIESEL],),
             expect={"ingredients": 42.9, "van": 60.0}, tol=0.005,
             hint="Start with an empty dictionary. For each expense, add its amount to its category's total, starting from 0 with .get(category, 0)."),
    function("category_totals of nothing", call="category_totals", args=([],), expect={},
             hint="No expenses, no categories: an empty dictionary."),
    function("biggest of four receipts", call="biggest", args=([FLOUR, INSURANCE, BUTTER, DIESEL],), expect=INSURANCE,
             hint="biggest returns the whole dictionary of the largest expense, not just its amount."),
    function("biggest with a tie", call="biggest", args=([FLOUR, DIESEL, OVEN],), expect=DIESEL,
             hint="Diesel and the oven repair are both 60.00. The one added first wins, so only replace the biggest when an amount is strictly bigger."),
    function("biggest of nothing", call="biggest", args=([],), expect=None,
             hint="An empty list has no biggest expense. Return None before looking at expenses[0]."),
    output("Amounts that aren't amounts",
           inputs=afternoon("1|butter|ingredients|twenty", "1|eggs|ingredients|0", "1|refund|van|-5", "1|milk|ingredients|", "2", "5"),
           expect="\n".join([REFUSED] * 4) + "\n" + NONE_YET + "\n0 expenses, 0.00 in all.",
           hint="A word, nothing at all, 0 and anything below 0 are all refused, and nothing is added."),
    output("Tidy categories",
           inputs=afternoon("1| flour |Ingredients |18.4", "1|butter| ingredients|24.5", "1|diesel|VAN|60", "3", "5"),
           expect="Added flour.\nAdded butter.\nAdded diesel.\n"
                  "ingredients: 42.90\nvan: 60.00\nTotal: 102.90\n3 expenses, 102.90 in all.",
           hint="Strip spaces off what's typed and lower the category, so Ingredients and ingredients add up together."),
    output("Totals in alphabetical order",
           inputs=afternoon("1|diesel|van|60", "1|flour|ingredients|18.4", "1|oven repair|bakery|85", "1|electricity|utilities|41.25", "3", "5"),
           expect="Added diesel.\nAdded flour.\nAdded oven repair.\nAdded electricity.\n"
                  "bakery: 85.00\ningredients: 18.40\nutilities: 41.25\nvan: 60.00\nTotal: 204.65\n"
                  "4 expenses, 204.65 in all.",
           hint="Categories come out alphabetically, whatever order they went in. sorted() on the totals dictionary gives its keys in order."),
    output("The list keeps the order they were added",
           inputs=afternoon("1|van insurance|van|212", "1|flour|ingredients|18.4", "1|apples|ingredients|3.2", "2", "5"),
           expect="Added van insurance.\nAdded flour.\nAdded apples.\n"
                  "van insurance: 212.00 (van)\nflour: 18.40 (ingredients)\napples: 3.20 (ingredients)\n"
                  "3 expenses, 233.60 in all.",
           hint="List shows the receipts in the order they were added, not sorted."),
    output("Biggest, then a bigger one",
           inputs=afternoon("1|diesel|van|60", "1|oven repair|bakery|60", "4", "1|van insurance|van|212", "4", "5"),
           expect="Added diesel.\nAdded oven repair.\nBiggest: diesel, 60.00 (van)\n"
                  "Added van insurance.\nBiggest: van insurance, 212.00 (van)\n3 expenses, 332.00 in all.",
           hint="On a tie, the one added first is the biggest."),
    output("One expense", inputs=afternoon("1|flour|ingredients|18.4", "5"),
           expect="Added flour.\n1 expense, 18.40 in all.",
           hint="One is 1 expense. Any other number is expenses."),
    output("Wrong choices of every kind", inputs=["", "6", "add", "0", "5"],
           expect="\n".join([WRONG] * 4) + "\n0 expenses, 0.00 in all.",
           hint="Anything that isn't 1 to 5 gets the same reply: blank lines and words too."),
    output("Choices with spaces round them", inputs=[" 1 ", "flour", "ingredients", "18.4", " 2", "5 "],
           expect="Added flour.\nflour: 18.40 (ingredients)\n1 expense, 18.40 in all.",
           hint="Tidy the menu choice too: spaces at the ends of anything don't count."),
    output("A long afternoon",
           inputs=afternoon("1|flour|ingredients|18.40", "4", "1|diesel|van|60", "7", "1|butter|Ingredients|24.5",
                            "1|van insurance|Van|212", "1|eggs|ingredients|nine", "3", "4", "2", "5"),
           expect="Added flour.\nBiggest: flour, 18.40 (ingredients)\nAdded diesel.\n" + WRONG + "\n"
                  "Added butter.\nAdded van insurance.\n" + REFUSED + "\n"
                  "ingredients: 42.90\nvan: 272.00\nTotal: 314.90\n"
                  "Biggest: van insurance, 212.00 (van)\n"
                  "flour: 18.40 (ingredients)\ndiesel: 60.00 (van)\nbutter: 24.50 (ingredients)\nvan insurance: 212.00 (van)\n"
                  "4 expenses, 314.90 in all.",
           hint="Follow the afternoon through by hand, one choice at a time, and find the first line that differs."),
]
