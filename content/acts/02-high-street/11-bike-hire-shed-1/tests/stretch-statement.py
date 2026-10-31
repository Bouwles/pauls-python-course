def aaesha_statement(ctx):
    m = ctx.module()
    a = m.Account("Aaesha", 1042)
    a.deposit(2000)
    a.withdraw(750)
    a.withdraw(9999)
    a.deposit(5)
    wanted = ["In: £20.00", "Out: £7.50", "In: £0.05", "Balance: £12.55"]
    if a.statement() != wanted:
        raise CheckFailed("The statement has a line for every payment that happened, then the balance.", expected="\n".join(wanted), actual=repr(a.statement()))
    if str(a) != "Account 1042, Aaesha: £12.55":
        raise CheckFailed("str() should still give the one line.", expected="Account 1042, Aaesha: £12.55", actual=str(a))


def empty_statement(ctx):
    m = ctx.module()
    a = m.Account("Yahya", 13)
    if a.statement() != ["Balance: £0.00"]:
        raise CheckFailed("A new account's statement is just its balance.", expected="['Balance: £0.00']", actual=repr(a.statement()))


TESTS = [custom("Aaesha's statement", aaesha_statement, visible=True), custom("A statement with nothing on it", empty_statement)]
