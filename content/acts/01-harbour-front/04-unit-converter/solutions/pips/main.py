print("1. Knots to mph")
print("2. Knots to km/h")
choice = input("Choose 1 or 2: ")
knots = float(input("How many? "))
if choice == "1":
    print(f"That's {knots * 1.15078:.2f} mph.")
elif choice == "2":
    print(f"That's {knots * 1.852:.2f} km/h.")
else:
    print("No such option.")
