from stock import new_day, sell, bake_more, report

friday = new_day()
sell(friday, "bread", 30)
sell(friday, "buns", 55)
bake_more(friday, "buns", 12)
sell(friday, "buns", 10)

saturday = new_day()
sell(saturday, "bread", 5)

for line in report(saturday):
    print(line)
