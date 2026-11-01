---
id: make
type: make
title: Make the to-do list
on_pass: { riya.pleased: "Number two done, and three moved up to two. Every commission, in the order they asked." }
hints:
  nudge: "Which command has to turn a person's number into an index? And what should happen before you use a number that might not be on the list?"
  plan:
    - Start with an empty list
    - Keep asking for a command
    - Stop on the quit word
    - Add to the end
    - Take one out, if there is one
    - Show each item with its number from 1
    - Catch anything else
    - Report after the loop
  shape: |
    tasks = ___
    while True:
        command = input("Command? ")
        if command == "quit":
            ___
        elif command == "add":
            tasks.___(input("Task? "))
        elif command == "done":
            number = int(input("Number? "))
            if number >= 1 and number <= ___:
                print("Done:", tasks.pop(___))
            else:
                print(f"No task {number}.")
        elif command == "list":
            if len(tasks) == 0:
                print("Nothing to do.")
            for spot in range(___):
                print(f"{spot + 1}. {tasks[spot]}")
        else:
            print("Commands: add, list, done, quit.")
    print(f"Left to do: {___}")
---
Write Riya's to-do list: `add`, `list`, `done` and `quit`.

```
Command? add
Task? Neil's rocket poster
Command? add
Task? Caitlin's album cover
Command? list
1. Neil's rocket poster
2. Caitlin's album cover
Command? done
Number? 1
Done: Neil's rocket poster
Command? quit
Left to do: 1
```

An empty list prints `Nothing to do.` A number that isn't on the list, like 0 or 7, gets `No task 7.` and nothing comes off. Any other command gets `Commands: add, list, done, quit.`

Paul's labels from the questions queue are in the file.
