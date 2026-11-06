---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud: "Can you look at mine? Softmax. Every column adds up to exactly 1. I checked."
  - yahya.pleased: "And I subtract the biggest score once, for the whole batch. Saves time. Something's still off."
dialogue_after:
  - yahya.surprised: "Rows. A row is one digit, so a row adds up to 1. Columns are nothing in particular."
  - yahya.thinking: "And one biggest score per row. Otherwise a quiet row gets shifted into nothing."
hints:
  nudge: "Which axis runs along a row? Each row is one digit's ten chances."
  plan:
    - Check what each row adds up to
    - Divide each row by its own total
    - Shift each row by its own biggest score
    - Keep the totals and maxima as columns, so they line up with their rows
  shape: |
    def softmax(Z):
        exps = np.exp(Z - Z.max(axis=___, keepdims=True))
        return exps / exps.sum(axis=___, keepdims=___)
---
`axis=0` works down the columns; `axis=1` works along each row. A batch has a row per digit, so softmax has to work along the rows.

Run it. The second line should say each row adds up to 1. There are two bugs: once the rows add up, try `softmax(np.array([[1000.0, 1001.0], [0.0, 1.0]]))`.
