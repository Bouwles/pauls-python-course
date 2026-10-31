# The Workshop to-do list, for anyone with a terminal. Kept in todo.json.
import argparse
import json
import sys
from pathlib import Path


def load(path):
    """The tasks in the file, or an empty list if there's no file yet."""
    if not Path(path).exists():
        return []
    try:
        with open(path) as file:
            return json.load(file)
    except ValueError:
        print(f"{path} isn't a to-do list I can read.", file=sys.stderr)
        sys.exit(1)


def save(path, tasks):
    with open(path, "w") as file:
        json.dump(tasks, file, indent=2)


def find(tasks, number):
    for task in tasks:
        if task["number"] == number:
            return task
    return None


def main():
    # Describe the tool
    parser = argparse.ArgumentParser(description="The Workshop to-do list.")
    # Say what it takes, with types and defaults
    parser.add_argument("--file", default="todo.json", help="where the list is kept (default todo.json)")
    commands = parser.add_subparsers(dest="command", required=True)
    adding = commands.add_parser("add", help="put a task on the list")
    adding.add_argument("task", help="what needs doing")
    listing = commands.add_parser("list", help="show the list")
    listing.add_argument("--open", action="store_true", help="only the tasks not done yet")
    finishing = commands.add_parser("done", help="tick a task off")
    finishing.add_argument("number", type=int, help="the task's number")
    # Read what was typed
    args = parser.parse_args()

    tasks = load(args.file)
    # Do the job
    if args.command == "add":
        number = max([task["number"] for task in tasks], default=0) + 1
        tasks.append({"number": number, "task": args.task, "done": False})
        save(args.file, tasks)
        print(f"Added {number}: {args.task}")
    elif args.command == "list":
        shown = [task for task in tasks if not (args.open and task["done"])]
        if not shown:
            print("Nothing on the list.")
        for task in shown:
            box = "[x]" if task["done"] else "[ ]"
            print(f"{task['number']} {box} {task['task']}")
    elif args.command == "done":
        task = find(tasks, args.number)
        # Refuse bad values: say why on sys.stderr, exit with 1
        if task is None:
            print(f"There's no task {args.number}.", file=sys.stderr)
            sys.exit(1)
        if task["done"]:
            print(f"Already done: {task['task']}")
        else:
            task["done"] = True
            save(args.file, tasks)
            print(f"Done: {task['task']}")


# Run only when started as a program
if __name__ == "__main__":
    main()
