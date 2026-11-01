# Times table trainer, for Aaesha's memory experiment
# 1. Ask which table
table = int(input("Which table? "))

# 2. Print every row, lined up
for n in range(1, 13):
    print(f"{n:2} x {table} = {n * table:3}")

# 3. Start the score at zero
print("Quiz time.")
score = 0

# 4. Ask each question in a loop
for n in range(8, 13):
    answer = int(input(f"{n} x {table}? "))
    # 5. Mark it and keep score
    if answer == n * table:
        print("Right.")
        score = score + 1
    else:
        print(f"No, {n * table}.")

# 6. Report the score once, after the loop
print(f"Score: {score} out of 5")
