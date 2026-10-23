age = int(input("Age? "))
hour = int(input("Hour of sailing? "))
trip = input("Return? ")

if age < 5:
    fare = 0.00
elif age < 16:
    fare = 1.50
elif age < 65:
    if hour < 7 or hour >= 19:
        fare = 4.00
    else:
        fare = 3.00
else:
    fare = 1.50

if trip == "yes":
    fare = fare * 2

print(f"Fare: {fare:.2f}")
