---
id: explain
type: explain
title: Three rounds
dialogue:
  - yahya: "Policy iteration took three goes from the traditional line. Value iteration took seventeen sweeps."
  - yahya: "So policy iteration is faster. Obviously."
prompt: "From the traditional line, policy iteration settles in three rounds; value iteration needs seventeen sweeps. Why can policy iteration stop after so few rounds, and why isn't it really less work?"
answer: "Each round evaluates the policy exactly, so every improvement is a real one, and a policy can only change in so many places before nothing is left to improve. It stops the moment a round changes no arrows. But every round contains a whole policy evaluation, itself a loop of sweeps, so the total sweeping is similar. Value iteration does one sweep and one improvement at a time; policy iteration does many sweeps per improvement."
concept: policy-iteration
---
Count them if you like: add a counter to each loop and print it.
