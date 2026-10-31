import ast as _ast

SHAPE = "Write it like 12 * 4, with spaces."
NOT_NUMBERS = "Those aren't both numbers."
ZERO = "Nothing divides by zero."
OPERATOR = "Use +, -, * or /."
BYE = "Done for today."


def catches_by_name(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.ExceptHandler):
            if node.type is None or (isinstance(node.type, _ast.Name) and node.type.id in ("Exception", "BaseException")):
                return "Catch each error by name: except ValueError, except ZeroDivisionError. Catching everything hides real mistakes."


TESTS = [
    function("calculate(12.5, \"*\", 4)", call="calculate", args=(12.5, "*", 4.0), expect=50.0, visible=True),
    output("A good sum, a bad one, then quit", inputs=["12.5 * 4", "twelve + 4", "quit"],
           expect="= 50.00\n" + NOT_NUMBERS + "\n" + BYE, visible=True),
    function("calculate(9, \"-\", 12)", call="calculate", args=(9.0, "-", 12.0), expect=-3.0),
    function("calculate(1, \"/\", 4)", call="calculate", args=(1.0, "/", 4.0), expect=0.25),
    function("calculate(2, \"+\", 2.5)", call="calculate", args=(2.0, "+", 2.5), expect=4.5),
    function("An operator it doesn't know", call="calculate", args=(2.0, "^", 3.0), expect=None,
             hint="For any op that isn't + - * or /, calculate reaches the end with nothing to give back. return None says so."),
    output("Two and two", inputs=["2 + 2", "quit"], expect="= 4.00\n" + BYE),
    output("Into the negative", inputs=["5 - 12", "quit"], expect="= -7.00\n" + BYE),
    output("Negative numbers", inputs=["-3 * 4", "quit"], expect="= -12.00\n" + BYE,
           hint="float(\"-3\") is -3.0. A minus sign stuck to a number is part of the number."),
    output("Dividing", inputs=["7 / 2", "quit"], expect="= 3.50\n" + BYE),
    output("Spaces round the sum", inputs=["  9 * 3 ", "  quit  "], expect="= 27.00\n" + BYE,
           hint="Strip the spaces off the ends before you check for quit."),
    output("Divide by zero, then carry on", inputs=["8 / 0", "8 / 2", "quit"], expect=ZERO + "\n= 4.00\n" + BYE,
           hint="Dividing by zero raises a ZeroDivisionError. Catch it by name, print the message, and let the loop go round again."),
    output("A word on the right", inputs=["4 + four", "quit"], expect=NOT_NUMBERS + "\n" + BYE,
           hint="float() raises a ValueError for text that isn't a number, on either side."),
    output("An operator it doesn't know", inputs=["2 ^ 3", "7 % 2", "quit"], expect=OPERATOR + "\n" + OPERATOR + "\n" + BYE,
           hint="When calculate hands back None, there was no answer. Check with is None before printing."),
    output("No spaces", inputs=["12*4", "quit"], expect=SHAPE + "\n" + BYE,
           hint="12*4 doesn't split into three parts. Count them before trying anything else."),
    output("Too much in one sum", inputs=["1 + 2 + 3", "quit"], expect=SHAPE + "\n" + BYE,
           hint="One operator per sum, so exactly three parts. Five parts gets the reminder too."),
    output("A blank line", inputs=["", "quit"], expect=SHAPE + "\n" + BYE,
           hint="A blank line splits into no parts at all. It needs the reminder, not a crash."),
    output("Quit straight away", inputs=["quit"], expect=BYE),
    output("A whole day",
           inputs=["100 / 8", "fund * 2", "3.5 + 0.25", "6 / 0", "6 x 7", "40", "0 - 0.5", "quit"],
           expect="= 12.50\n" + NOT_NUMBERS + "\n= 3.75\n" + ZERO + "\n" + OPERATOR + "\n" + SHAPE + "\n= -0.50\n" + BYE,
           hint="Follow the sums through by hand, one at a time, and find the first line that differs."),
    structure("Uses try and except", requires=["Try"],
              message="Catch the errors with try and except. That's the job."),
    structure("Catches each error by name", check=catches_by_name),
]
