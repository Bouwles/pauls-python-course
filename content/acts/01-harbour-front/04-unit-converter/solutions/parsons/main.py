weather = input("Weather? ")
temp = int(input("Temperature? "))
if weather == "dry":
    if temp < 30:
        print("Run outside")
    else:
        print("Treadmill. Too hot.")
else:
    print("Treadmill. Wait for the rain to stop.")
