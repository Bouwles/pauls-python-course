A NameError is what Python raises when a line uses a name it doesn't know: `NameError: name 'total' is not defined`. A name is any word in your code that isn't in quotes and isn't part of the language itself, such as a variable, a function or a module. Python looks each name up at the moment the line runs, and if nothing has been given that name yet, the program stops. The usual causes are a typo, a variable used before it has a value, text that is missing its quotes, and a module that was never imported.

## How it works

```python
passengers = 12
print("Booked:", passengers)
print("Seats left:", 40 - pasengers)
```

```text
Booked: 12
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print("Seats left:", 40 - pasengers)
                              ^^^^^^^^^
NameError: name 'pasengers' is not defined. Did you mean: 'passengers'?
```

Line 2 ran before the crash. A NameError happens while the program is running, unlike a [SyntaxError](/handbook/syntax-error), which stops everything before it starts. The `^` marks underline the unknown name, and `Did you mean: 'passengers'?` is Python comparing it with the names that do exist and suggesting the closest. It is a guess based on spelling, so check it before you accept it.

For a module used without an `import`, the hint is different:

```python
print(math.sqrt(49))
```

```text
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    print(math.sqrt(49))
          ^^^^
NameError: name 'math' is not defined. Did you forget to import 'math'?
```

Add `import math` at the top of the file. The other causes get no special hint. A variable used on a line above the one that sets it fails because Python runs [from the top down](/handbook/program-order). So does a variable that is only set inside an `if` whose test was `False`: that line never ran, so the name was never made. A variable created inside a function doesn't exist outside it, which is a matter of [scope](/handbook/scope).

## Common mistakes

- **Leaving off the quotes.** `print(Emma)` doesn't print the word Emma. Without quotes, `Emma` is a name, and nothing has that name. Text needs quotes: `print("Emma")`.
- **Getting the capitals wrong.** Python treats `score` and `Score` as two different names. The same goes for `true`, which fails with `Did you mean: 'True'?`.
- **Using a name before the line that creates it.** Moving the `print` above the assignment, or calling a function above its `def`, gives a NameError even though the name is defined further down. Move the definition up.
- **Importing a module but not using its name.** After `import random`, the function is `random.randint`, not `randint` on its own. See [import](/handbook/imports).

## Related

[Reading a traceback](/handbook/reading-tracebacks) explains the rest of the report, and [variables](/handbook/variables) covers how a name gets its value in the first place.
