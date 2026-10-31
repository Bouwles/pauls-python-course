print("1. Km to miles")
print("2. Min per km to min per mile")
choice = input("Choose 1 or 2: ")
amount = float(input("How many? "))
if choice == "1":
    print(f"That's {amount / 1.609344:.2f} miles.")
elif choice == "2":
    print(f"That's {amount * 1.609344:.2f} min per mile.")
else:
    print("No such option.")
