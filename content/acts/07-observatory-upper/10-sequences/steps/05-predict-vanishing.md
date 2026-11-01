---
id: predict-vanishing
type: predict
title: Blame from twenty hours back
concept: rnns
dialogue:
  - neil.neutral: "My weights were trained the way the blackboard chain was: backwards. Only backwards through time."
  - yahya.pleased: "So the network learns from every hour it read. All of them, equally."
code: |
  w_memory = 0.9
  h = 0.6                       # the hidden state, hour after hour
  blame = 1.0                   # blame arriving at tonight's hidden state

  for hour in range(20):        # passed back an hour at a time
      blame = blame * w_memory * (1 - h ** 2)

  print(f"{blame:.6f}")
question: "Each hour back, the blame passes through the memory weight and through tanh, whose slope is `1 - h ** 2`. How much reaches the hidden state twenty hours ago?"
options:
  - text: "0.000016"
    correct: true
    feedback: "Right. Each hour back multiplies the blame by 0.9 × 0.64, about 0.58. Twenty of those leave almost nothing. Hours long past barely move the weights: the vanishing gradient."
  - text: "1.000000"
    misconception: bptt-blame-unchanged
    feedback: "The blame is multiplied by every link it passes back through, here the memory weight and the slope of tanh, once per hour. It doesn't arrive twenty hours back intact."
  - text: "0.576000"
    misconception: bptt-one-step-only
    feedback: "That's one hour back. The loop multiplies twenty times, once per hour, and 0.576 to the twentieth is tiny."
  - text: "11.520000"
    misconception: bptt-blame-adds
    feedback: "The factors multiply, they don't add up: blame passes through one link after another, and each link scales whatever arrives."
after: |
  Run it. Then try `w_memory = 1.5` with `h = 0.2`. Blame can explode as well as vanish.
---
**Backpropagation through time** unrolls the network: hour 1, hour 2, and so on to the last, one long chain with the same weights at every link. The blame for a wrong guess then flows back along the chain, hour by hour, exactly as on the blackboard.

On the way back, each hour multiplies the blame by that hour's local slopes.
