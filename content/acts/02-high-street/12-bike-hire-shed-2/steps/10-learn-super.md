---
id: learn-super
type: learn
title: Let the parent do its part
concept: super
code: |
  class Drone:
      def __init__(self, name):
          self.name = name
          self.flights = 0

      def describe(self):
          return f"{self.name}, {self.flights} flights"


  class CameraDrone(Drone):
      def __init__(self, name, megapixels):
          super().__init__(name)
          self.megapixels = megapixels

      def describe(self):
          return super().describe() + f", {self.megapixels} MP camera"


  print(CameraDrone("Kestrel", 12).describe())
---
A subclass that writes its own `__init__` replaces the parent's, so the parent's setup no longer runs by itself. `super()` reaches the parent's methods, for this same object.

`super().__init__(name)` runs `Drone`'s setup on the new camera drone. Then the subclass adds what only it has.

It works for any method. `super().describe()` gets the parent's line, and the camera drone adds to it, so nothing is written twice. Neil's reference book will build on a book's line the same way. The example prints `Kestrel, 0 flights, 12 MP camera`.

The usual slip is to leave out `super().__init__(...)`. Then the parent's attributes are never set, and reading one is an AttributeError.
