---
id: learn-mutants
type: learn
title: Testing the tests
concept: mutation-testing
code: |
  def ticket(age):
      """A stargazing night on the roof: free under 5, 2 pounds up to 15, 4 pounds from 16."""
      if age < 5:
          return 0
      return 2 if age <= 15 else 4


  def mutant(age):
      """The same, with one small mistake: < 5 has become <= 5."""
      if age <= 5:
          return 0
      return 2 if age <= 15 else 4


  def typical_tests(price):
      return price(3) == 0 and price(10) == 2 and price(40) == 4


  def edge_tests(price):
      return typical_tests(price) and price(5) == 2 and price(15) == 2 and price(16) == 4


  print(typical_tests(ticket), typical_tests(mutant))
  print(edge_tests(ticket), edge_tests(mutant))
---
Tests that pass tell you the code does what they check. They don't tell you what they'd miss. To find out, test the tests.

**Mutation testing** makes a small, deliberate mistake in the code, a **mutant**: a `<` for a `<=`, a missing check, a wrong number. Then it runs the tests. If they still all pass, the mutant has **survived**, and found a gap in the tests.

The example's ticket prices have a mutant that charges nothing to a five-year-old. Tests of typical ages pass on both, so the first line prints `True True`: the mutant survived. Tests at the edges of each price, 5, 15 and 16, catch it: `True False`.

The usual mistake is testing only typical values. Mutants live at the edges, and in what should be refused.
