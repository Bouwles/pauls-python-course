# The lost property report, for Mrs Vance.

found = ["black umbrella", "red scarf", "blue glove", "red scarf", "library book", "black umbrella"]
reported = ["red scarf", "green bicycle bell", "black umbrella"]


def show(items):
    if len(items) == 0:
        return "none"
    return ", ".join(sorted(items))


def report(found, reported):
    found = set(found)
    reported = set(reported)
    print(f"Handed in: {len(found)} different items")
    print("Matched:", show(found & reported))
    print("Nobody has asked about:", show(found - reported))
    print("Still missing:", show(reported - found))


report(found, reported)
