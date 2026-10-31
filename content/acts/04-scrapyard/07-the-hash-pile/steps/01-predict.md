---
id: predict
type: predict
title: A first guess at a rule
concept: hashing
dialogue:
  - paul: "A first guess at a rule. Add up the letters, as numbers. Keep the remainder."
code: |
  def letter_sum(name):
      total = 0
      for character in name:
          total = total + ord(character)
      return total


  for name in ["pots", "stop", "spot", "nuts"]:
      print(name, letter_sum(name) % 8)
question: "`ord` gives each letter's number: `ord(\"p\")` is 112. What does this print?"
options:
  - text: |-
      pots 6
      stop 6
      spot 6
      nuts 2
    correct: true
    feedback: "Right. The same four letters add up to the same total in any order, so three names land in pile 6. Different names sharing a pile is called a collision, and it's allowed."
  - text: |-
      pots 6
      stop 3
      spot 1
      nuts 2
    misconception: different-names-different-piles
    feedback: "Nothing stops two names landing in one pile. `letter_sum` adds the same four letters for pots, stop and spot, so all three get 454, and all three go in pile 6."
  - text: |-
      pots 56.75
      stop 56.75
      spot 56.75
      nuts 57.25
    misconception: percent-is-percentage
    feedback: "`%` isn't division. It's the remainder: 454 is 56 eights and 6 over, so it's 6. A remainder by 8 is always a whole number from 0 to 7, one for each pile."
after: |
  Run it. Then try a few names of your own, and find two different words that land in the same pile.
---
Eight piles, numbered 0 to 7. A **hash function** turns a name into a number, the same number every time for the same name; the remainder by the number of piles picks the pile. To find a name again, work out the same sum and go straight to that pile.
