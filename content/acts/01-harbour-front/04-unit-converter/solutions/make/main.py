# Yahya's unit converter
# 1. Show the menu and ask
print("1. Km to miles")
print("2. Min per km to min per mile")
print("3. Laps to km")
choice = input("Choose 1, 2 or 3: ")

# 2. Choose what to do, one option at a time
if choice == "1":
    km = float(input("How many? "))
    print(f"That's {km / 1.609344:.2f} miles.")
elif choice == "2":
    pace = float(input("How many? "))
    print(f"That's {pace * 1.609344:.2f} min per mile.")
elif choice == "3":
    laps = float(input("How many? "))
    # 3. Decide again inside the option that has a special case
    indoor = input("Indoor track (yes or no)? ")
    if indoor == "yes":
        km = laps * 0.2
    else:
        km = laps * 0.4
    print(f"That's {km:.2f} km.")
# 4. Catch everything else
else:
    print("No such option.")
