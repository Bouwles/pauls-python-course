---
id: learn-sentinel
type: learn
title: A word that means stop
concept: sentinels
code: |
  word = input("Word? ")
  while word != "stop":
      print("You said", word)
      word = input("Word? ")
  print("Stopped.")
inputs: ["hello", "tea", "stop"]
---
A **sentinel** is a value that means stop, not another answer. Here it's the word `stop`. `!=` means is not equal to, so the loop runs while the word is anything else.

It lets a loop take as many answers as someone has, then end when they say so.

The program asks once before the loop, so the test has a word to look at. It asks again on the last line inside the loop, ready for the next pass. Type `hello`, `tea`, then `stop`, and it prints `You said hello`, `You said tea`, then `Stopped.`

People often expect `stop` to be printed too. It never is. It's tested at the top, and the loop ends before doing anything with it.
