score = 0
for n in range(8, 13):
    answer = int(input(f"{n} x 9? "))
    if answer == n * 9:
        print("Right.")
        score = score + 1
    else:
        print(f"No, {n * 9}.")
print(f"Score: {score} out of 5")
