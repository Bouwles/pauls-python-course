import time

clock = time.perf_counter
log = []


def timed(func):
    def wrapper(*args, **kwargs):
        start = clock()
        result = func(*args, **kwargs)
        log.append((func.__name__, clock() - start))
        return result
    return wrapper


@timed
def weigh(kilos, per_kilo):
    return round(kilos * per_kilo, 2)


@timed
def label(name, price):
    return f"{name.title()}: £{price:.2f}"


print(label("plums", weigh(1.5, 2.10)))
print(len(log), "calls logged")
