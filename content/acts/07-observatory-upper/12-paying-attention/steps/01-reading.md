---
id: reading
type: reading
title: Questions, labels and contents
dialogue:
  - wendt: "The top floor. Her last blackboard, and nobody rubbed this one out."
  - wendt: "Q, K, V. And underneath: every letter asks the ones before it a question."
---
A bigram looks one character back. **Attention** lets every character look back at all the ones before it, and decide how much each one matters.

Think of Mira's post office. You come in with a **query**: what you're after. Each pigeonhole has a **key**, its label, and holds a **value**, its contents. You don't take one pigeonhole. You take a little from every one, more from the pigeonholes whose labels best match what you asked for.

In numbers: each character makes a query, a key and a value, each a short row of numbers. The score of a query against a key is their dot product: big when they point the same way. Softmax turns a query's scores into weights that add up to 1. The answer is the weighted mix of the values.

The network learns how to make the queries, keys and values.
