# Ferro's unit converter
# 1. Show the menu and ask
print("1. Knots to mph")
print("2. Knots to km/h")
print("3. Miles to km")
choice = input("Choose 1, 2 or 3: ")

# 2. Choose what to do, one option at a time
if choice == "1":
    knots = float(input("How many? "))
    print(f"That's {knots * 1.15078:.2f} mph.")
elif choice == "2":
    knots = float(input("How many? "))
    print(f"That's {knots * 1.852:.2f} km/h.")
elif choice == "3":
    miles = float(input("How many? "))
    # 3. Decide again inside the option that has a special case
    sea = input("Sea miles (yes or no)? ")
    if sea == "yes":
        print(f"That's {miles * 1.852:.2f} km.")
    elif sea == "no":
        print(f"That's {miles * 1.609344:.2f} km.")
    else:
        print("Yes or no, please.")
# 4. Catch everything else
else:
    print("No such option.")
