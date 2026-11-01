import functools
import time

# The checks swap this for a clock that ticks in known steps.
# Read the time with clock(), never time.perf_counter() directly.
clock = time.perf_counter
log = []


# timed(func): a decorator that logs (name, seconds) for every call.
# Take the function in
# Write a wrapper that accepts any arguments, and keep the name
# Do the extra job: read clock() before and after, and log it
# Call the original and hand back its result
# Return the wrapper


# slowest(entries, count): names of the slowest calls, slowest first.


# slow_calls(entries, limit): the entries over limit seconds, in order.


# retry(func): a decorator that tries again when func raises ConnectionError.
# Up to TRIES calls in all; after the last one, let the error out.
TRIES = 3


# The fruit table's till. Leave these alone, apart from putting @timed on the
# first three and @retry on take_card.
PRICE_BOOK = {"plums": 2.10, "leeks": 0.90, "figs": 3.20}
# The card reader. It answers about half the time, in damp weather.
READER = iter([False, True, True, True, True])


def look_up_price(name):
    # Reads the whole price book for every single item. I know.
    # I'll fix it after Saturday. C.
    time.sleep(0.3)
    return PRICE_BOOK[name]


def weigh(kilos, per_kilo):
    return round(kilos * per_kilo, 2)


def label(name, price):
    return f"{name.title()}: £{price:.2f}"


def take_card(amount):
    if not next(READER, True):
        raise ConnectionError("The card reader isn't answering.")
    return f"Paid £{amount:.2f} by card"


if __name__ == "__main__":
    for name, kilos in [("plums", 1.5), ("leeks", 2), ("figs", 0.5)]:
        print(label(name, weigh(kilos, look_up_price(name))))
    print(take_card(6.55))
    print("Slowest:", slowest(log, 1))
    for name, seconds in slow_calls(log, 0.1):
        print(f"{name} took {seconds:.2f} s")
