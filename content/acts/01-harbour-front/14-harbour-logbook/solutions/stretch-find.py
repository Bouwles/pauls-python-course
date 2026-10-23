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


def log_in(boat, out, trips):
    if boat not in out:
        print(f"{boat} isn't out.")
    else:
        out.remove(boat)
        trips[boat] = trips.get(boat, 0) + 1
        print(f"{boat} logged in.")


def find(boat, out, trips):
    if boat in out:
        print(f"{boat} is out. {plural(trips.get(boat, 0))} today.")
    elif boat in trips:
        print(f"{boat} is in. {plural(trips[boat])} today.")
    else:
        print(f"No record of {boat}.")


def report(out, trips):
    if len(out) == 0:
        print("Out: none")
    else:
        print("Out: " + ", ".join(sorted(out)))
    if len(trips) == 0:
        print("No trips yet.")
    for boat in sorted(trips):
        print(f"{boat}: {plural(trips[boat])}")


def main():
    out = []
    trips = {}
    while True:
        choice = input("1 out, 2 in, 3 report, 4 quit, 5 find: ")
        if choice == "1" or choice == "2" or choice == "5":
            boat = tidy(input("Boat? "))
            if boat == "":
                print("A boat needs a name.")
            elif choice == "1":
                log_out(boat, out)
            elif choice == "2":
                log_in(boat, out, trips)
            else:
                find(boat, out, trips)
        elif choice == "3":
            report(out, trips)
        elif choice == "4":
            if len(out) > 0:
                print("Still out: " + ", ".join(sorted(out)))
            print("Logbook closed.")
            break
        else:
            print("Not an option. Choose 1 to 5.")


if __name__ == "__main__":
    main()
