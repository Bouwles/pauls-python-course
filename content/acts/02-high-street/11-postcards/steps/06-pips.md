---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mira wants to know how many go abroad. Tom's to Lisbon, the captain's to Bilbao."
  - pip: "It says nought. No error, nothing red. Just nought."
dialogue_after:
  - pip: "\"ABROAD\" is just text. Stamp.ABROAD is the stamp. They never match, and nothing complains."
hints:
  nudge: "What is `card.stamp`: a string, or a member of `Stamp`?"
  plan:
    - Find the comparison that is never true
    - Compare the stamp with a member of Stamp, not with text
  shape: |
    for card in cards:
        if card.stamp == ___:
            count += 1
---
Run Pip's program. Two of the three postcards are going abroad, so it should print `2 going abroad`.

No traceback this time. Read the comparison carefully.
