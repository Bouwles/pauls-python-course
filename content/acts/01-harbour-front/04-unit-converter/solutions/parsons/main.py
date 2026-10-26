tide = input("Tide? ")
wind = int(input("Wind in knots? "))
if tide == "high":
    if wind < 34:
        print("Sailing")
    else:
        print("No sailing. Gale.")
else:
    print("No sailing. Wait for the tide.")
