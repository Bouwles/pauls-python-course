print("1. Km/h to mph")
print("2. Knots to km/h")
choice = input("Choose 1 or 2: ")
speed = float(input("Speed? "))
if choice == "1":
    print(f"That's {speed / 1.609344:.2f} mph.")
elif choice == "2":
    print(f"That's {speed * 1.852:.2f} km/h.")
else:
    print("No such option.")
