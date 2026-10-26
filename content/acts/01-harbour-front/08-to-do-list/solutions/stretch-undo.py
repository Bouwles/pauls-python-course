tasks = []
last_task = None
last_index = 0

while True:
    command = input("Command? ")
    if command == "quit":
        break
    elif command == "add":
        tasks.append(input("Task? "))
    elif command == "done":
        number = int(input("Number? "))
        if number >= 1 and number <= len(tasks):
            last_index = number - 1
            last_task = tasks.pop(last_index)
            print("Done:", last_task)
        else:
            print(f"No task {number}.")
    elif command == "undo":
        if last_task is None:
            print("Nothing to undo.")
        else:
            tasks.insert(last_index, last_task)
            print("Back:", last_task)
            last_task = None
    elif command == "list":
        if len(tasks) == 0:
            print("Nothing to do.")
        for spot in range(len(tasks)):
            print(f"{spot + 1}. {tasks[spot]}")
    else:
        print("Commands: add, list, done, quit.")

print(f"Left to do: {len(tasks)}")
