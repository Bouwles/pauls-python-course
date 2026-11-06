---
id: predict-class-call
type: predict
title: The class or the account
concept: self
code: |
  class Account:
      def __init__(self, holder):
          self.holder = holder
          self.balance = 0

      def deposit(self, pence):
          self.balance = self.balance + pence


  riya = Account("Riya")
  Account.deposit(500)
  print(riya.balance)
question: What happens?
verify: error
options:
  - text: It prints 500
    misconception: class-call-reaches-objects
    feedback: "`Account.deposit` has no idea which account you mean. Called on the class, a method is a plain function, and you'd have to pass the account yourself."
  - text: It prints 0, because the 500 went into a new account
    misconception: class-call-makes-new-object
    feedback: "Calling a method on the class doesn't open an account. It runs the function with exactly what you pass it."
  - text: A TypeError
    correct: true
    error: TypeError
    feedback: "On the class, `deposit` is a function with two parameters. `500` became `self`, and `pence` was never given. Call it on an account: `riya.deposit(500)`."
---
This time the method is called on the class, `Account`, not on an account. It happens more than you'd think, usually at the end of a long day.
