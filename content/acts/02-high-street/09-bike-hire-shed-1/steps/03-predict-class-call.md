---
id: predict-class-call
type: predict
title: The class or the bike
concept: self
code: |
  class Bike:
      def __init__(self, number):
          self.number = number
          self.rider = None

      def hire(self, rider):
          self.rider = rider


  red = Bike(7)
  Bike.hire("Ann")
  print(red.rider)
question: What happens?
verify: error
options:
  - text: It prints Ann
    misconception: class-call-reaches-objects
    feedback: "`Bike.hire` has no idea which bike you mean. Called on the class, a method is a plain function, and you'd have to pass the bike yourself."
  - text: It prints None, because Ann hired a new bike
    misconception: class-call-makes-new-object
    feedback: "Calling a method on the class doesn't make a bike. It runs the function with exactly what you pass it."
  - text: A TypeError
    correct: true
    error: TypeError
    feedback: "Right. On the class, `hire` is a function with two parameters. `\"Ann\"` became `self`, and `rider` was never given. Call it on a bike: `red.hire(\"Ann\")`."
---
Calling a method on the class instead of on one of its objects. It happens more than you'd think, usually late in the day.
