# Logbook for the harbour. Agnes asked for it in 1994, and has the date written down.
# Rule one of a logbook: everything that goes out comes back, or someone asks why.
# My own log, up the hill, has one entry going out and none coming in.
# Nobody asks. A.P.


def tidy(name):
    return name.strip().title()


def plural(count):
    if count == 1:
        return "1 trip"
    return f"{count} trips"


def log_out(boat, out):
    if boat in out:
        print(f"{boat} is already out.")
    else:
        out.append(boat)
        print(f"{boat} logged out.")


# Agnes counts a trip when the boat is back, not when it leaves.
def log_in(boat, out, trips):
    if boat not in out:
        print(f"{boat} isn't out.")
    else:
        out.remove(boat)
        trips[boat] = trips.get(boat, 0) + 1
        print(f"{boat} logged in.")


def report(out, trips):
    if len(out) == 0:
        print("Out: none")
    else:
        print("Out: " + ", ".join(sorted(out)))
    if len(trips) == 0:
        print("No trips yet.")
    for boat in sorted(trips):
        print(f"{boat}: {plural(trips[boat])}")
    busiest = ""
    for boat in sorted(trips):
        if busiest == "" or trips[boat] > trips[busiest]:
            busiest = boat
    if busiest != "":
        print(f"Busiest: {busiest} ({plural(trips[busiest])})")


def main():
    out = []
    trips = {}
    while True:
        choice = input("1 out, 2 in, 3 report, 4 quit: ")
        if choice == "1" or choice == "2":
            boat = tidy(input("Boat? "))
            if boat == "":
                print("A boat needs a name.")
            elif choice == "1":
                log_out(boat, out)
            else:
                log_in(boat, out, trips)
        elif choice == "3":
            report(out, trips)
        elif choice == "4":
            if len(out) > 0:
                print("Still out: " + ", ".join(sorted(out)))
            print("Logbook closed.")
            break
        else:
            print("Not an option. Choose 1 to 4.")


if __name__ == "__main__":
    main()
