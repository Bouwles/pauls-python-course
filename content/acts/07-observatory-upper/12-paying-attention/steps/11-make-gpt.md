---
id: make-gpt
type: make
title: A tiny GPT
files: [attention.py, block.py, gpt.py]
entry: gpt.py
starter_from: block
timeout_ms: 30000
on_pass: { aaesha.laughing: "Montmorency would have stopped half a man. It has never read a word. Well, it has read every word, and understood none." }
hints:
  nudge: "Which row of the last block's output belongs to the character that comes next? And how many characters can the position table take at once?"
  plan:
    - Look up each character, and add where it sits
    - Through every block in turn
    - Normalise, and score every character from the last row
    - Sharpen or soften, then draw
    - Only the last CONTEXT characters fit
  shape: |
    def next_scores(ids, params):
        X = embed(ids, params)
        for block in params["blocks"]:
            X = transformer_block(X, ___)
        X = layer_norm(X, params["lnf_gain"], params["lnf_shift"])
        return X[___] @ params["W_out"] + params["b_out"]


    def sample_next(scores, temperature, rng):
        return int(rng.choice(len(scores), p=softmax(___)))
---
`gpt_weights.json` holds a transformer trained on Jerome K. Jerome's Three Men in a Boat: two of your blocks, four heads each, 32 numbers a character, a context of 32 characters, and a final layer norm and a table that turns the last row into a score for each of the 30 characters. `load_gpt` is written.

Write `embed`, `next_scores`, `sample_next` and `generate` in `gpt.py`, as listed at the top. Your attention and your block do the work.

```text
the river to day, and the strange of the work the busin't so a morning from before on the
george said, and a not a sing to much as real the partice, and the man who had the sland wa
montmorency would have stopped half a man on the back that it was a since to be in a methin
```

It writes the way the book is spelt and punctuated, and makes no sense. That's 28,000 numbers. The big GPT models are built the same way, with billions.
