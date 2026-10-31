"""Personal finance: the rules. No files and no printing in here.

The requirements, as Riya and Paul agreed them:

CATEGORIES                     ("food", "fun", "home", "income", "shop", "travel")
Transaction(day, pence, category, note="")
                               a frozen dataclass: day is a datetime.date, pence is
                               a whole number, more than 0 for money in and less
                               than 0 for money out
MoneyError                     an Exception for any broken rule

Ledger(transactions=None, budgets=None)
                               every transaction so far, and a dictionary of monthly
                               budgets in pence. It keeps its own copies: adding never
                               changes the list or dictionary you passed in.
  .transactions                that list: every transaction, every month
  .budgets                     that dictionary: category to pence a month
  .add(day, pence, category, note="")
                               adds a Transaction and returns it, or raises
                               MoneyError with one of these messages:
      an amount of 0             An amount can't be 0.
      no such category           There's no category called sweets.
      income less than 0         Income is money in, so it has to be more than 0.
      spending more than 0       Spending on food is money out, so it has to be less than 0.
  .remove(transaction)         takes it out, or raises:
                               That transaction isn't in the ledger.
  .set_budget(category, pence) sets that category's budget, or raises:
      income, or no such one     There's no spending category called income.
      0 or less                  A budget has to be more than 0.
  .balance()                   everything in, less everything out, in pence
  .in_month(year, month)       a list of that month's Transactions, in date order
  .spending(year, month)       a dictionary of how much went on each kind of spending
                               that month, in pence, as a positive number, in
                               alphabetical order; a category with no spending isn't in it
  .over_budget(year, month)    a list of the categories that spent more than their
                               budget that month, in alphabetical order
"""
# Riya's note, from the first page of her plan:
# Who's going to use this? Students with a part-time job and rent to pay.
# Test it on a made-up month first. Real money only goes in once it works. R.

from dataclasses import dataclass
from datetime import date
