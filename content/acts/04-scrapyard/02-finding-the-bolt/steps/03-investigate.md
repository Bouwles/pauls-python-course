---
id: investigate
type: investigate
title: The bolt drawers
concept: binary-search
code: |
  def find_bolt(sizes, size):
      low = 0
      high = len(sizes) - 1
      looks = 0
      while low <= high:
          middle = (low + high) // 2
          looks = looks + 1
          print(f"Look {looks}: drawer {middle} holds {sizes[middle]} mm")
          if sizes[middle] == size:
              return middle
          elif sizes[middle] < size:
              low = middle + 1
          else:
              high = middle - 1
      return -1


  rack = [3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30]
  print(find_bolt(rack, 16))
tasks:
  - id: first-look
    prompt: "Run it. Which drawer does it open first?"
    kind: answer
    accept: ["5", "drawer 5", "drawer five", "five"]
    feedback: "Drawer 5, the middle of 0 to 10. It holds 10 mm, too small, so drawers 0 to 5 go without another look."
    wrong: "Read the first line it prints."
  - id: missing
    prompt: "Search for `7` instead. What does the last line say?"
    kind: answer
    accept: ["-1", "minus one", "minus 1"]
    feedback: "-1, after four looks. `low` passed `high`: there was nowhere left for a 7 mm bolt to be."
    wrong: "Change 16 to 7 on the last line, run it, and read the very last line."
  - id: out-of-order
    prompt: "Swap the `4` and the `16` in `rack`, so it's out of order. Search for `16` again. What does the last line say?"
    kind: answer
    accept: ["-1", "minus one", "minus 1"]
    feedback: "-1, with a 16 mm bolt sitting in drawer 1. Binary search trusts the order to decide which half to throw away. Out of order, it threw away the half with the bolt in it, and said nothing. Sort first, or search one at a time."
    wrong: "The rack should start [3, 16, 5, ... and have 4 where 16 was. Search for 16."
  - id: a-million
    prompt: "Put the rack back in order. Change `find_bolt` to return `(middle, looks)` when it finds the bolt and `(-1, looks)` when it doesn't. Then search a rack of a million, `list(range(1_000_000))`, for `999_999`."
    kind: run
    tests: |
      TESTS = [
          output("A million drawers", expect="(999999, 20)", match="last_line",
                 hint="Both returns give back two things now: return middle, looks and return -1, looks. Then search list(range(1_000_000)) for 999_999."),
      ]
    solution: |
      def find_bolt(sizes, size):
          low = 0
          high = len(sizes) - 1
          looks = 0
          while low <= high:
              middle = (low + high) // 2
              looks = looks + 1
              if sizes[middle] == size:
                  return middle, looks
              elif sizes[middle] < size:
                  low = middle + 1
              else:
                  high = middle - 1
          return -1, looks


      rack = list(range(1_000_000))
      print(find_bolt(rack, 999_999))
  - id: linear-looks
    prompt: "How many looks would a linear search have needed for that one?"
    kind: answer
    accept: ["1000000", "1,000,000", "1 000 000", "1_000_000", "a million", "one million", "million"]
    feedback: "A million: it's in the last drawer. Twenty against a million is O(log n) against O(n)."
    wrong: "A linear search starts at drawer 0. Where is 999,999?"
---
Paul's search, on the rack of bolt drawers under Neil's kart stand, sizes in millimetres. It prints every drawer it opens.

Press Step through to watch `low`, `middle` and `high` close in.
