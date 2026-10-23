# Tom's lamp check
# 1. Find out how many times
checks = int(input("Checks tonight? "))

# 2. Repeat, numbered from 1
for check in range(1, checks + 1):
    print(f"Check {check}: all well")

# 3. Count down
for number in range(checks, 0, -1):
    print(number)

# 4. Finish once, after the loops
print("Lamp lit.")
