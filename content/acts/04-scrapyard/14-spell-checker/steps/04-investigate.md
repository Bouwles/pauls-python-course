---
id: investigate
type: investigate
title: Each handful once
concept: dynamic-programming
code: |
  calls = {"count": 0}


  def ways(amount, coins):
      """Ways to make amount from coins: either use the first coin again, or never use it."""
      calls["count"] = calls["count"] + 1
      if amount == 0:
          return 1
      if amount < 0 or not coins:
          return 0
      return ways(amount - coins[0], coins) + ways(amount, coins[1:])


  print(ways(50, (1, 2, 5, 10, 20)), "ways")
  print(calls["count"], "calls")
tasks:
  - id: fifty
    prompt: "Run it. How many ways are there to make 50p from 1p, 2p, 5p, 10p and 20p coins?"
    kind: answer
    accept: ["450", "450 ways"]
    feedback: "450. Each handful is counted once, because once a coin is dropped with `coins[1:]`, it never comes back: every handful is built in the same order: all its 1p coins, then its 2p coins, and so on."
    wrong: "Read the first line it prints."
  - id: calls
    prompt: "How many calls to `ways` did that take?"
    kind: answer
    accept: ["27457", "27,457", "27 457"]
    feedback: "27,457 calls for 450 ways. The same questions come up again and again: how many ways to make 10p from 5p, 10p and 20p coins is asked 97 times."
    wrong: "Read the second line it prints."
  - id: cache
    prompt: "Put `@functools.cache` on the line above `def ways`, with `import functools` at the top, and run it again."
    kind: run
    tests: |
      import re


      def fewer_calls(ctx):
          result = ctx.run_program()
          if "450 ways" not in result.output:
              raise CheckFailed("It should still find 450 ways.", expected="450 ways", actual=result.output)
          numbers = re.findall(r"(\d+) calls", result.output)
          if not numbers or int(numbers[-1]) > 1000:
              raise CheckFailed("With the cache, each question is worked out once, so there should be a few hundred calls.",
                                expected="a few hundred calls", actual=result.output)


      TESTS = [custom("The same answer, far fewer calls", fewer_calls,
                      hint="@functools.cache goes on its own line, directly above def ways, and needs import functools at the top.")]
    solution: |
      import functools

      calls = {"count": 0}


      @functools.cache
      def ways(amount, coins):
          """Ways to make amount from coins: either use the first coin again, or never use it."""
          calls["count"] = calls["count"] + 1
          if amount == 0:
              return 1
          if amount < 0 or not coins:
              return 0
          return ways(amount - coins[0], coins) + ways(amount, coins[1:])


      print(ways(50, (1, 2, 5, 10, 20)), "ways")
      print(calls["count"], "calls")
  - id: cached-calls
    prompt: "How many calls now?"
    kind: answer
    accept: ["338", "338 calls"]
    feedback: "338: one for each different question. The cache answers the rest without running the function at all, which is why the count doesn't go up for them."
    wrong: "Read the second line again, after adding the cache."
  - id: two-pounds
    prompt: "Now make £2 from all eight coins: `ways(200, (1, 2, 5, 10, 20, 50, 100, 200))`. How many ways?"
    kind: answer
    accept: ["73682", "73,682", "73 682"]
    feedback: "73,682 ways, in about two thousand calls. Without the cache, you'd still be waiting."
    wrong: "Change the call on the first print line and run it with the cache in place."
---
The handful counter for Yahya's bonus question: 50p from 1p, 2p, 5p, 10p and 20p coins, with a count of every call. `calls` is a dictionary so the function can add to it.

`@functools.cache`, from the file tree printer, keeps every answer, filed by its arguments. That's dynamic programming done for you.
