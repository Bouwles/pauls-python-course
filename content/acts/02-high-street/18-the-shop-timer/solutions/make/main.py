import functools
import time

# The checks swap this for a clock that ticks in known steps.
# Read the time with clock(), never time.perf_counter() directly.
clock = time.perf_counter
log = []


def timed(func):
    """Log (name, seconds) for every call to func."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = clock()
        result = func(*args, **kwargs)
        log.append((func.__name__, clock() - start))
        return result
    return wrapper


def slowest(entries, count):
    """Names of the count slowest calls, slowest first."""
    by_time = sorted(entries, key=lambda entry: entry[1], reverse=True)
    return [name for name, seconds in by_time[:count]]


def slow_calls(entries, limit):
    """The entries that took longer than limit seconds, in order."""
    return list(filter(lambda entry: entry[1] > limit, entries))


TRIES = 3


def retry(func):
    """Call func again when it raises ConnectionError, up to TRIES calls in all."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for attempt in range(1, TRIES + 1):
            try:
                return func(*args, **kwargs)
            except ConnectionError:
                if attempt == TRIES:
                    raise
    return wrapper


# Sanjay's till. Leave these alone, apart from putting @timed on the first three
# and @retry on take_card.
PRICE_BOOK = {"plums": 2.10, "leeks": 0.90, "figs": 3.20}
# The card reader in the corner. It answers about half the time, in damp weather.
READER = iter([False, True, True, True, True])


@timed
def look_up_price(name):
    # Reads the whole price book for every single item. I know.
    # I meant to fix it the winter I went up the hill. A.P.
    time.sleep(0.3)
    return PRICE_BOOK[name]


@timed
def weigh(kilos, per_kilo):
    return round(kilos * per_kilo, 2)


@timed
def label(name, price):
    return f"{name.title()}: £{price:.2f}"


@retry
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
