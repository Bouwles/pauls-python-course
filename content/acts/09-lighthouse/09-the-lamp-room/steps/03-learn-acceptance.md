---
id: learn-acceptance
type: learn
title: Tests from the rules
concept: edge-cases
code: |
  def by_the_rules(visibility_m):
      """The rule, written down: the lamp is lit when visibility is under 2000 m."""
      return visibility_m < 2000


  def as_learned(visibility_m):
      """What a controller learned from ordinary nights: nearly the rule, but not quite."""
      return visibility_m < 2400


  def ordinary_nights(lamp):
      return lamp(300) is True and lamp(15000) is False


  def at_the_edge(lamp):
      return lamp(1999) is True and lamp(2000) is False


  for lamp in [by_the_rules, as_learned]:
      print(lamp.__name__, ordinary_nights(lamp), at_the_edge(lamp))
---
**Acceptance tests** turn written requirements into checks: one test for each rule, so that passing them means the rules are kept. They're how you accept, or refuse, something you didn't build.

A learned controller agrees with the rules on the nights it learned from. So test each rule where it's easy to get nearly right: on both sides of its edge. For "under 2000 m", that's 1999 and 2000. Then add the nights it never saw.

The example has the rule and a learned copy. Ordinary nights pass both: `True` twice. The edge catches the copy: `by_the_rules True True`, then `as_learned True False`.

Good acceptance tests pass on anything that follows the rules, and fail on anything that doesn't, however small the difference.
