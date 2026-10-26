---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Mira's postage. Two small jobs, each with its own name."
code: |
  # Mira's postage: two small functions and a main() that uses them
  def postage(grams):
      if grams <= 100:
          return 0.85
      else:
          return 1.55

  def label(name, grams):
      return f"{name}: {grams} g, {postage(grams):.2f}"

  def main():
      name = input("Name? ")
      grams = int(input("Grams? "))
      print(label(name, grams))

  if __name__ == "__main__":
      main()
inputs: ["Bea Hollis", "240"]
subgoals:
  - label: Name the job and what it needs
    lines: [2, 2]
  - label: Work it out and hand it back
    lines: [3, 6]
  - label: Build on a smaller function
    lines: [8, 9]
  - label: Keep the asking and printing in main()
    lines: [11, 14]
  - label: Run main() when the file is run
    lines: [16, 17]
explain:
  prompt: "Why does `postage` return the price instead of printing it?"
  answer: "So other code can use it. `label` puts the price inside a sentence. A printed price would go straight to the screen, and `label` would get `None`."
  concept: return-values
---
The last two lines mean: run `main()` when this file is run, but not when another program borrows its functions. The checks borrow them, one at a time. That's all you need to know about those lines for now.
