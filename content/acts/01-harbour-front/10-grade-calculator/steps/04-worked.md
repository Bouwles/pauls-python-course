---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Printing costs for the class. Two small jobs, each with its own name."
code: |
  # Printing costs: two small functions and a main() that uses them
  def print_cost(pages):
      if pages <= 10:
          return 0.50
      else:
          return 1.20

  def label(name, pages):
      return f"{name}: {pages} pages, {print_cost(pages):.2f}"

  def main():
      name = input("Name? ")
      pages = int(input("Pages? "))
      print(label(name, pages))

  if __name__ == "__main__":
      main()
inputs: ["Neil", "24"]
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
  prompt: "Why does `print_cost` return the price instead of printing it?"
  answer: "So other code can use it. `label` puts the price inside a sentence. A printed price would go straight to the screen, and `label` would get `None`."
  concept: return-values
---
The last two lines mean: run `main()` when this file is run, but not when another program borrows its functions. The checks borrow them, one at a time. That's all you need to know about those lines for now.
