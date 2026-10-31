---
id: proposal
type: milestone
title: "Milestone 1: the proposal"
test_plan: true
evidence: link
dialogue:
  - paul: "One page. Who it's for, what done looks like, what could go wrong. Then I'll tell you it's too big."
  - caitlin: "Mine's exactly the right size."
  - paul: "They all are, on the first page."
checklist:
  - id: user
    text: "The proposal names the person it's for, and you've asked them what they need."
    why: "Guessing what someone needs is how projects end up used by nobody."
  - id: done
    text: "It describes the moment the project is done, in a sentence or two a stranger could check."
    why: "If you can't describe done, you'll never reach it. You'll just stop."
  - id: slice
    text: "It names the first slice: the smallest version that does one useful thing from end to end."
    why: "A slice that works beats a whole that doesn't, every time."
  - id: risks
    text: "It lists three risks, the things most likely to go wrong, with what you'll do about each."
    why: "The risks you write down are the ones you plan for. The others plan for you."
  - id: testable
    text: "It says which parts will be plain functions you can test, and which parts sit round the outside."
    why: "Decide where the testable middle is before you write it, or it ends up tangled in the screen."
  - id: plan
    text: "Your test plan has at least three tests for the first slice, each with the result you expect."
    why: "Tests planned before the code test what it should do. Tests written after test what it happens to do."
  - id: cut
    text: "You've cut the proposal down by half at least once."
    why: "Every proposal is too big. Mine were. Cut it now, while cutting costs nothing."
---
One page, as a README in a new repository or a gist: who it's for, what done looks like, the first slice, and three risks.

Ask the person it's for before you write the page, not after. Then describe done in a sentence a stranger could check: "The shop owner types a weight and a destination and gets the price." Not "a postage system".

Three risks: what's most likely to go wrong? Something you've never done before, a library you haven't tried, a person who's hard to pin down. For each, say what you'll do about it.

Your test plan is for the first slice, as sentences for now. You've practised turning sentences into tests.
