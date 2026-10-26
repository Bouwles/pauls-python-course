table = int(input("Which table? "))

if table == 0:
    for row in range(1, 13):
        for col in range(1, 13):
            print(f"{row * col:4}", end="")
        print()
else:
    for n in range(1, 13):
        print(f"{n:2} x {table} = {n * table:3}")

    print("Quiz time.")
    score = 0
    for n in range(8, 13):
        answer = int(input(f"{n} x {table}? "))
        if answer == n * table:
            print("Right.")
            score = score + 1
        else:
            print(f"No, {n * table}.")
    print(f"Score: {score} out of 5")
