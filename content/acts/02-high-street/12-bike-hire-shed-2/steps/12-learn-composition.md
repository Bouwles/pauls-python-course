---
id: learn-composition
type: learn
title: Has a, or is a
concept: composition
code: |
  class Hangar:
      def __init__(self):
          self.drones = []

      def add(self, name):
          if name in self.drones:
              return False
          self.drones.append(name)
          return True

      def __len__(self):
          return len(self.drones)


  hangar = Hangar()
  print(hangar.add("Kestrel"), hangar.add("Moth"), hangar.add("Kestrel"))
  print(len(hangar), hangar.drones)
---
**Composition** builds an object out of other things it keeps in its attributes. A hangar isn't a kind of list. It has a list of drones, kept in `self.drones`, and offers only what a hangar should do.

That's the argument by the kettle. Ask "is a" or "has a". A reference book is a book: inherit. A library has books: compose.

The hangar's `add` refuses a drone it already has, which a plain list never would. `__len__` is another dunder method: it's what `len(hangar)` calls. The example prints `True True False`, then `2 ['Kestrel', 'Moth']`.

The usual slip is to expect a hangar to have the list's methods, like `.sort()`. It only has the methods it writes.
