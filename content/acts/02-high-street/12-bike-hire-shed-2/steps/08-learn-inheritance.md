---
id: learn-inheritance
type: learn
title: A kind of something
concept: inheritance
code: |
  class Drone:
      def __init__(self, name):
          self.name = name

      def max_height(self):
          return 120

      def describe(self):
          return f"{self.name}: up to {self.max_height()} m"


  class IndoorDrone(Drone):
      def max_height(self):
          return 3


  print(Drone("Kestrel").describe())
  print(IndoorDrone("Moth").describe())
---
**Inheritance** makes a new class out of an old one. `class IndoorDrone(Drone):` makes a **subclass**: an indoor drone is a kind of drone, and `Drone` is its **parent**.

A subclass gets every method its parent has, `__init__` included. It replaces only the ones it writes itself, which is called **overriding** them. So `IndoorDrone` writes just the one thing that's different.

`describe` is written in `Drone`, but when it runs on the Moth, `self` is the indoor drone, so `self.max_height()` finds the indoor drone's own version. The example prints `Kestrel: up to 120 m`, then `Moth: up to 3 m`.

The usual slip is to think a parent's method always calls the parent's versions. It calls the object's.
