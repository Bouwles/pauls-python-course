---
id: worked
type: worked
title: How Moss would remember
dialogue:
  - moss: "Work it out once. Chalk the answer on the crate. Next time, read the crate."
code: |
  calls = []


  def choices(parts, picks, known):
      calls.append((parts, picks))
      if (parts, picks) in known:
          return known[(parts, picks)]
      if picks == 0 or picks == parts:
          answer = 1
      else:
          answer = choices(parts - 1, picks - 1, known) + choices(parts - 1, picks, known)
      known[(parts, picks)] = answer
      return answer


  print(choices(20, 10, {}), "ways,", len(calls), "calls")
subgoals:
  - label: Count every call
    lines: [5, 5]
  - label: Worked out before? Hand that back
    lines: [6, 7]
  - label: The smallest cases, answered straight away
    lines: [8, 9]
  - label: Otherwise, work it out from smaller cases
    lines: [10, 11]
  - label: Write it down, then hand it back
    lines: [12, 13]
explain:
  prompt: "Why does Moss write each answer into `known` before returning it, rather than only reading from it?"
  answer: "An answer that's never written down can never be read back. Without line 12, `known` stays empty, and every call works its answer out from scratch: all 369,511 of them."
  concept: memoisation
---
The merchant wants a sample crate: 10 parts from a shelf of 20. How many different samples could Nell pick? Either the first part is in it, and 9 more come from the other 19, or it isn't, and all 10 do.

Without lines 6, 7 and 12, `choices(20, 10)` makes 369,511 calls and works out `choices(10, 5)` 252 separate times. With them: 201 calls. Remembering answers like this is called **memoisation**.

Python will do it for you. `import functools`, then put `@functools.cache` on the line above the `def`. It keeps every answer, filed by its arguments.
