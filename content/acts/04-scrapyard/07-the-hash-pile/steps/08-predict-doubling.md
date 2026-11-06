---
id: predict-doubling
type: predict
title: Where does it go now?
concept: hash-maps
code: |
  number = 45
  print(number % 8)
  print(number % 16)
question: "A name's hash is 45. Which pile is it in with 8 piles, and with 16?"
options:
  - text: |-
      5
      13
    correct: true
    feedback: "Right. 45 is five eights and 5 over, and two sixteens and 13 over. After the doubling it lives in pile 13, so a lookup there won't find it in pile 5."
  - text: |-
      5
      5
    misconception: resize-keeps-old-piles
    feedback: "The pile is the remainder by the number of piles, and that number has changed. 45 divided by 16 leaves 13."
  - text: |-
      5
      10
    misconception: doubling-doubles-pile-number
    feedback: "Doubling the piles doesn't double each pile number. Work out the remainder again: 45 is two sixteens, 32, and 13 over."
---
`%` gives the remainder after dividing.
