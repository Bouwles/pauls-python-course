# Riya's to-do list, for her commissions
# 1. Start with an empty list
tasks = []

# 2. Keep asking for a command
while True:
    command = input("Command? ")
    # 3. Stop on the quit word
    if command == "quit":
        break
    # 4. Add to the end
    elif command == "add":
        tasks.append(input("Task? "))
    # 5. Take one out, if there is one
    elif command == "done":
        number = int(input("Number? "))
        if number >= 1 and number <= len(tasks):
            print("Done:", tasks.pop(number - 1))
        else:
            print(f"No task {number}.")
    # 6. Show each item with its number from 1
    elif command == "list":
        if len(tasks) == 0:
            print("Nothing to do.")
        for spot in range(len(tasks)):
            print(f"{spot + 1}. {tasks[spot]}")
    # 7. Catch anything else
    else:
        print("Commands: add, list, done, quit.")

# 8. Report after the loop
print(f"Left to do: {len(tasks)}")
