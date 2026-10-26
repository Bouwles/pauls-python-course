A set in Python is a collection that holds each value once and keeps no order. Making one from a list, `set(items)`, is the quickest way to remove duplicates, and asking whether a value is `in` a set stays fast however big the set gets. You write one with curly brackets, `{"glove", "scarf"}`, and add to it with `.add()`. A set is the right tool when the question is "which different values are there?" or "have I seen this one before?", and the wrong one when order or repeats matter.

## How it works

A set keeps one copy of each value. Adding a value it already holds changes nothing and raises no error:

```python
box = ["umbrella", "glove", "umbrella", "scarf", "glove"]
unique = set(box)
print(len(box), len(unique))

unique.add("glove")
unique.add("kite")
print(sorted(unique))
print("kite" in unique)

print(sorted(set("kettle")))
print(type({}), type(set()))
```

```text
5 3
['glove', 'kite', 'scarf', 'umbrella']
True
['e', 'k', 'l', 't']
<class 'dict'> <class 'set'>
```

A set has no positions, so `unique[0]` is a TypeError: `'set' object is not subscriptable`. When you print a set directly, the order you see comes from how Python stores it internally, and for a set of strings it can change from one run of the program to the next. That is why the example prints `sorted(unique)`: `sorted()` gives back an ordinary list in a fixed order, which is what a reader or a test expects.

`set("kettle")` doesn't make a set holding the word. It loops over the string, so you get its letters, each once. To make a set containing the whole word, put it in curly brackets, `{"kettle"}`, or wrap it in a list first, `set(["kettle"])`.

Values in a set must be ones that can't change, such as numbers, strings and tuples. Putting a list in a set is a TypeError, because a list can change after it goes in.

## Common mistakes

- **Expecting a set to keep repeats.** It never does. If you need to know how many times each value appears, count with a dictionary instead.
- **Thinking repeated values are thrown away completely.** `set(["umbrella", "glove", "umbrella"])` still contains `"umbrella"`, once. Every different value survives; only the extra copies go.
- **Writing `{}` for an empty set.** Empty curly brackets make an empty dict, because dicts used the brackets first. Write `set()`.
- **Expecting order, or indexing with `[0]`.** A set doesn't remember the order things went in, and has no first item. Use `sorted()` to show it, or keep a list when order matters.
- **Expecting `set("kettle")` to hold the word.** It holds the letters `e`, `k`, `l` and `t`. Use `{"kettle"}`.

## Related

Two sets can be compared in one step, which is covered in [comparing sets](/handbook/set-operations). Why `in` is so quick on a set is explained in [how fast is in?](/handbook/membership-speed). For counting repeats rather than removing them, use [dictionaries](/handbook/dictionaries).
