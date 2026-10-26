COMMON = {"0000", "1111", "1234", "1212", "7777", "2580", "4321", "6969", "1004", "2000"}


def pins(ctx, count, *args):
    make = getattr(ctx.module(), "make_pin", None)
    if make is None:
        raise CheckFailed("There is no function called make_pin.")
    return [make(*args) for _ in range(count)]


def four_digit_pins(ctx):
    made = pins(ctx, 400)
    for pin in made:
        if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
            raise CheckFailed("make_pin() should give four digits, as text.", actual=repr(pin))
    if set(made) & COMMON:
        raise CheckFailed("make_pin() gave a code from COMMON_PINS.", actual=", ".join(sorted(set(made) & COMMON)))
    if len(set(made)) < 300:
        raise CheckFailed("Too many repeats. Pick each digit with secrets.choice.")


def six_digit_pins(ctx):
    for pin in pins(ctx, 50, 6):
        if not isinstance(pin, str) or len(pin) != 6 or not pin.isdigit():
            raise CheckFailed("make_pin(6) should give six digits, as text.", actual=repr(pin))


def never_common(ctx):
    import secrets
    old = secrets.choice
    digits = iter("1234" * 3 + "5")
    secrets.choice = lambda seq: next(digits, "9")
    try:
        pin = pins(ctx, 1)[0]
    finally:
        secrets.choice = old
    if pin in COMMON:
        raise CheckFailed("When the digits come out as 1234, make_pin should try again.", actual=pin)


TESTS = [
    custom("Four digits, never a common code", four_digit_pins, visible=True),
    custom("Six digits", six_digit_pins),
    custom("1234 comes out, and is sent back", never_common,
           hint="Make a code, and if it's in COMMON_PINS, make another. A while loop with a return inside does it."),
]
