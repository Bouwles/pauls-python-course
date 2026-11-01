# Caitlin's kit book for the five-a-side team: two lists, kept in step.
names = ["Jon Hale", "Mae Grant", "Ray Lowe"]
sizes = [(112, 98, 84), (96, 88, 74), (101, 95, 79)]


def print_book(names, sizes):
    for number, (name, size) in enumerate(zip(names, sizes), start=1):
        chest, waist, leg = size
        print(f"{number}. {name}: chest {chest}, waist {waist}, leg {leg}")


def longest_leg(names, sizes):
    best_name, best_leg = names[0], sizes[0][2]
    for name, (chest, waist, leg) in zip(names, sizes):
        if leg > best_leg:
            best_name, best_leg = name, leg
    return best_name, best_leg


print_book(names, sizes)
name, leg = longest_leg(names, sizes)
print(f"Longest leg: {name}, {leg} cm")
