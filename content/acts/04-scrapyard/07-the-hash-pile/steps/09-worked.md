---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "My register, as a set made by hand. Names only, no values. Same piles as your map."
code: |
  def name_hash(name):
      number = 0
      for character in name:
          number = (number * 31 + ord(character)) % 1_000_003
      return number


  class Register:
      """The names on Paul's register, filed in piles, every probe counted."""

      def __init__(self, piles=4):
          self.piles = [[] for _ in range(piles)]
          self.count = 0
          self.probes = 0

      def _pile(self, name):
          return self.piles[name_hash(name) % len(self.piles)]

      def __contains__(self, name):
          for stored in self._pile(name):
              self.probes = self.probes + 1
              if stored == name:
                  return True
          return False

      def add(self, name):
          if name in self:
              return
          self._pile(name).append(name)
          self.count = self.count + 1
          if self.count > 0.75 * len(self.piles):
              self._double()

      def _double(self):
          old_piles = self.piles
          self.piles = [[] for _ in range(2 * len(old_piles))]
          for pile in old_piles:
              for name in pile:
                  self._pile(name).append(name)


  register = Register()
  for name in ["Aaesha", "Caitlin", "Neil", "Riya", "Yahya"]:
      register.add(name)
  print(len(register.piles), "piles")
  print("Neil" in register, "Paul" in register, register.probes, "probes")
subgoals:
  - label: Start with empty piles, a count, and no probes
    lines: [11, 14]
  - label: "Which pile: the hash, remainder by the number of piles"
    lines: [16, 17]
  - label: Look along that pile, a probe per comparison
    lines: [19, 24]
  - label: "Already there? Leave it"
    lines: [27, 28]
  - label: A new one goes on the end of its pile, and is counted
    lines: [29, 30]
  - label: Too full? Double the piles
    lines: [31, 32]
  - label: "Doubling: twice the piles, and everything moved to its new pile"
    lines: [34, 39]
explain:
  prompt: "Why does `_double` work out each name's pile again, rather than copying each old pile across whole?"
  answer: "A name's pile is its hash's remainder by the number of piles. With twice the piles, the remainder changes for many names, so each one has to go where a lookup will look for it now."
  concept: hash-maps
---
Paul's register is a set made by hand: names in piles, with no values. `name_hash` is a better rule than a letter sum: it multiplies by 31 before adding each letter, so `pots` and `stop` come out different. `__contains__` is what Python calls for `name in register`.

The labels beside the code are the steps he took. Your `HashMap` takes the same steps with `(name, value)` pairs, and they're in your file as comments.
