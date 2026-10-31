class Account:
    def __init__(self, holder, number):
        self.holder = holder
        self.number = number
        self.balance = 0

    def deposit(pence):
        self.balance = self.balance + pence

    def withdraw(self, pence):
        balance = self.balance - pence


aaesha = Account("Aaesha", 1042)
aaesha.deposit(2000)
aaesha.withdraw(750)
print(aaesha.holder, aaesha.balance)
