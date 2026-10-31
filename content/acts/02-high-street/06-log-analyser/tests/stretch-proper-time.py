def refuses(text, number, wanted):
    def check(ctx):
        module = ctx.module()
        try:
            module.parse_line(text, number)
        except ValueError as error:
            if str(error) != wanted:
                raise CheckFailed("The ValueError's message isn't quite right.", expected=wanted, actual=str(error))
            return
        raise CheckFailed(f"parse_line should raise ValueError for {text.strip()!r}.", expected=wanted, actual="no error")
    return check


TESTS = [
    function("A proper time is fine", call="parse_line", args=("06:42 | INFO | lights | on\n", 1),
             expect=("06:42", "INFO", "lights", "on"), visible=True),
    custom("7:5 is refused", refuses("7:5 | INFO | lights | on\n", 3, "line 3: bad time 7:5"), visible=True),
    custom("0642 is refused", refuses("0642 | INFO | lights | on\n", 9, "line 9: bad time 0642")),
]
