# Bea's till: the Ashbys' standing order
# 1. Name the prices and the quantities (loaves and buns)
loaves = 3
buns = 4
bread_price = 240
bun_price = 85

# 2. Work out the total in pence
total = loaves * bread_price + buns * bun_price

# 3. Split it into pounds and pence
pounds = total // 100
pence = total % 100

# 4. Show the results
print(total)
print(pounds, "pounds", pence, "pence")
