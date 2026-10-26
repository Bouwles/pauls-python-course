Parameters are the names in the brackets of a Python function's `def` line. They let one function work on different values each time it is called: `def round_cost(pints, price):` can price any round, because each call supplies its own numbers. The values a call passes in are called arguments. So in `round_cost(4, 3.5)`, `pints` and `price` are the parameters, and `4` and `3.5` are the arguments. Inside the function, a parameter behaves like an ordinary variable that already holds its argument.

## How it works

Arguments fill parameters by position: the first value goes to the first name, the second to the second. The names of any variables in the call play no part in it:

```python
def describe_order(item, quantity):
    print(f"{quantity} x {item}")

item = "bread"
quantity = 3
describe_order(item, quantity)
describe_order(quantity, item)
describe_order("milk", 2)
```

```text
3 x bread
bread x 3
2 x milk
```

The second call passes the same two variables the other way round, and the values swap with them: `item` inside the function gets 3. Matching names outside did not help, because Python never looks at them. The third call has no variables at all, only values, and works fine.

Each parameter needs a value on every call. Leave one out and Python stops before the function runs a single line, with a message that names what is missing:

```python
def round_cost(pints, price):
    return pints * price

print(round_cost(4, 3.5))
print(round_cost(4))
```

```text
14.0
Traceback (most recent call last):
  File "main.py", line 5, in <module>
    print(round_cost(4))
          ~~~~~~~~~~^^^
TypeError: round_cost() missing 1 required positional argument: 'price'
```

Passing too many is the same kind of error the other way: `round_cost(4, 3.5, 2)` gives `TypeError: round_cost() takes 2 positional arguments but 3 were given`. If a parameter should be optional, give it a value in the `def` line, `def round_cost(pints, price=3.5):`, and a call that leaves it out gets that value instead.

Parameters exist only while the call is running. Each call starts with fresh ones, and when it ends they are gone, so a function can't remember an argument from last time.

## Common mistakes

- **Thinking the variable passed in must have the parameter's name.** It can have any name, or no name at all: `round_cost(4, 3.5)` passes plain values. The parameter is the function's own name for whatever arrives.
- **Thinking values are matched by name.** Python matches by position, so `describe_order(quantity, item)` swaps them even though both names exist inside the function. Pass arguments in the order the `def` lists them. To match by name on purpose, write the name in the call: `describe_order(quantity=3, item="bread")`.
- **Expecting a missing argument to start at 0.** Python doesn't guess. A missing argument is a `TypeError`, and the function never runs. Pass every value, or give the parameter a default.

## Related

Parameters bring values into a [function](/handbook/functions); [return](/handbook/return-values) sends a result back out. Naming arguments in the call is covered in [keyword arguments](/handbook/keyword-arguments), optional parameters in [default arguments](/handbook/default-arguments), and why a parameter disappears after the call in [scope](/handbook/scope).
