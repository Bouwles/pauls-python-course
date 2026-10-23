---
id: make
type: make
title: Make Sanjay's timer
on_pass: { sanjay: "There it is. look_up_price, dawdling. I'd never have guessed. I'd have blamed the scales." }
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
---
The subgoals are in the file, above Sanjay's till. Run it and the report should name the dawdler:

```
Slowest: ['look_up_price']
look_up_price took 0.30 s
```

Your times will wobble a little. The checks don't use real time: they swap `clock` for one that ticks in known steps, so always read the time with `clock()`.

The hidden checks pass keyword arguments through, look at the decorated function's name, and make sure `slowest` doesn't reorder the log it was given.
