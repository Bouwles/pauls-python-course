Python strings are immutable: once a string has been made, none of its characters can be changed, added or removed. That is why `word[0] = "d"` fails with `TypeError: 'str' object does not support item assignment`, and why a line like `notice.upper()` on its own seems to do nothing. Every string method, and every slice, builds a new string and hands it back. To change what a variable says, you make the new text and point the variable at it: `notice = notice.upper()`. Most "my string didn't change" bugs come from forgetting this.

## How it works

Reading a character by position is allowed. Replacing one is not:

```python
word = "pull"
word[0] = "d"
```

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    word[0] = "d"
    ~~~~^^^
TypeError: 'str' object does not support item assignment
```

The fix is to build the string you want from pieces, then move the label:

```python
word = "pull"
old_word = word
word = "d" + word[1:]
print(word)
print(old_word)
```

```text
dull
pull
```

A variable is a name attached to a value, more like a label than a box. `old_word = word` puts a second label on the same string. Then `"d" + word[1:]` makes a brand-new string, `"dull"`, and `word = ...` moves the `word` label onto it. The string `"pull"` was never touched, and `old_word` proves it: it still points at the original. Nothing changed an object; one name moved to a different object.

This is also why it is safe for two names to share a string. Since nobody can edit it, a change made through one name can never surprise you through the other. Lists work differently, which is where [mutability](/handbook/mutability) and [list aliasing](/handbook/list-aliasing) come in.

## Common mistakes

- **Thinking a method changes the string.** `.upper()`, `.replace()`, `.strip()` and the rest all make a new string. `notice.upper()` builds `"GALE WARNING"` and hands it back, and `notice` still says `"gale warning"`. Keep the result with `=`, either under the same name (`notice = notice.upper()`) or a new one (`shout = notice.upper()`).
- **Expecting an error when the result isn't kept.** Python doesn't complain about an answer nobody stores. It works out the new string and throws it away, silently. If text you changed comes out unchanged, look for a method call with no `=` in front of it.
- **Swapping one character with `word[0] = "d"`.** That is the TypeError above. Build a new string with a slice and `+`, as in `word = "d" + word[1:]`, or use `.replace()` (which changes every match, so check that is what you want).

## Related

The methods that hand back new strings are in [String methods](/handbook/string-methods) and [strip() and replace()](/handbook/strip-replace). How names attach to values is covered in [variables](/handbook/variables).
