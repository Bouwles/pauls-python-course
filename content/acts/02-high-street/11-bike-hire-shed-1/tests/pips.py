def gwen_account(ctx):
    m = ctx.module()
    account = m.Account("Gwen", 2001)
    account.deposit(500)
    account.deposit(300)
    account.withdraw(200)
    if account.balance != 600:
        raise CheckFailed("Paying in 500 and 300, then taking out 200, leaves 600.", expected=600, actual=account.balance)


TESTS = [
    output("Bea's account", expect="Bea 1250", visible=True),
    custom("Gwen pays in twice and takes some out", gwen_account,
           hint="If only this fails, check that every change to the balance is made to self.balance."),
]
