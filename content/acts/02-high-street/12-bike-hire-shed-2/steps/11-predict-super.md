---
id: predict-super
type: predict
title: A setup that never ran
concept: super
code: |
  class Book:
      def __init__(self, title):
          self.title = title
          self.borrower = None


  class ReferenceBook(Book):
      def __init__(self, title, room):
          self.room = room


  atlas = ReferenceBook("Atlas of the Moon", "the Studio")
  print(atlas.room)
  print(atlas.title)
question: What happens when this runs?
verify: error
options:
  - text: |-
      the Studio
      Atlas of the Moon
    misconception: parent-init-runs-anyway
    feedback: "`ReferenceBook` wrote its own `__init__`, which replaces `Book`'s. Nothing called `super().__init__(title)`, so `title` was never set."
  - text: |-
      the Studio
      then an AttributeError
    correct: true
    error: AttributeError
    feedback: "Only the subclass's `__init__` ran, and it set `room` alone. `super().__init__(title)` as its first line would set `title` and `borrower` too."
  - text: An error on line 12, because ReferenceBook takes too many arguments
    misconception: parent-init-runs-anyway
    error: TypeError
    feedback: "`ReferenceBook`'s own `__init__` takes a title and a room, so the call fits. The trouble is what that `__init__` leaves out."
---
A reference book for the Studio, from a subclass that writes its own `__init__`.
