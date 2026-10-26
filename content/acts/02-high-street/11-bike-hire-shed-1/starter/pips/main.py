class Account:
    def __init__(self, holder, number):
        self.holder = holder
        self.number = number
        self.balance = 0

    def deposit(pence):
        self.balance = self.balance + pence

    def withdraw(self, pence):
        balance = self.balance - pence


bea = Account("Bea", 1042)
bea.deposit(2000)
bea.withdraw(750)
print(bea.holder, bea.balance)
