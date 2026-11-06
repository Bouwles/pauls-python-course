---
id: make
type: make
title: Make the decorators
on_pass: { caitlin.surprised: "There it is: look_up_price, dawdling. I blamed the scales. Measured beats guessed." }
hints:
  nudge: "Where in the wrapper do you read `clock()`, and what has to come back out of it at the end?"
  plan:
    - Take the function in
    - Write a wrapper that accepts any arguments, and keep the name
    - "Do the extra job: read clock() before and after, and log (name, seconds)"
    - Call the original and hand back its result
    - Return the wrapper
    - Put it on with @
    - "slowest: sort by seconds with key=, biggest first, then take the names"
    - "slow_calls: keep the entries over the limit"
    - "retry: the same wrapper, with a loop of tries inside"
  shape: |
    def timed(func):
        @functools.wraps(___)
        def wrapper(*args, **kwargs):
            start = ___()
            result = func(___)
            log.append((func.__name__, ___))
            return ___
        return ___


    def slowest(entries, count):
        by_time = sorted(entries, key=lambda entry: ___, reverse=True)
        return [name for name, seconds in by_time[:___]]


    def slow_calls(entries, limit):
        return list(filter(lambda entry: ___, entries))


    def retry(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, TRIES + 1):
                try:
                    return ___
                except ___:
                    if attempt == TRIES:
                        raise
        return wrapper
---
The steps are in the file, above the till. Run it: the card reader fails once and `retry` tries again, and the report names the dawdler:

```
Paid £6.55 by card
Slowest: ['look_up_price']
look_up_price took 0.30 s
```

`ConnectionError` is Python's own error for something that didn't answer. In `retry`, a bare `raise` inside the `except` lets the error you caught carry on out, for the last try.

Your times will wobble a little. The checks swap `clock` for one that ticks in known steps, so always read the time with `clock()`. They also pass keyword arguments through, look at the decorated functions' names, and hand `retry` a reader that never answers.
