# Neil's unit converter
# 1. Show the menu and ask
print("1. Km/h to mph")
print("2. Knots to km/h")
print("3. Mach to km/h")
print("4. Mph to km/h")
choice = input("Choose 1, 2, 3 or 4: ")

# 2. Choose what to do, one option at a time
if choice == "1":
    kmh = float(input("Speed? "))
    print(f"That's {kmh / 1.609344:.2f} mph.")
elif choice == "2":
    knots = float(input("Speed? "))
    print(f"That's {knots * 1.852:.2f} km/h.")
elif choice == "3":
    mach = float(input("Speed? "))
    # 3. Decide again inside the option that has a special case
    sea_level = input("At sea level (yes or no)? ")
    if sea_level == "yes":
        kmh = mach * 1225
    else:
        kmh = mach * 1062
    print(f"That's {kmh:.2f} km/h.")
elif choice == "4":
    mph = float(input("Speed? "))
    print(f"That's {mph * 1.609344:.2f} km/h.")
# 4. Catch everything else
else:
    print("No such option.")
