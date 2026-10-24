# Captain Ferro's boarding tally. The ferry carries twelve.
# Under 5: free. 5 to 15: 1.50. 16 to 64: 3.20. 65 and over: 2.00.
CAPACITY = 12

passengers = 0
fares = 0.0
while passengers < CAPACITY:
    answer = input("Age? ").strip()
    if answer == "":
        break
    if not answer.isdigit():
        print("Ages are whole numbers.")
        continue
    age = int(answer)
    if age < 5:
        fare = 0.0
    elif age <= 15:
        fare = 1.50
    elif age <= 64:
        fare = 3.20
    else:
        fare = 2.00
    if fare == 0:
        print("Fare: free")
    else:
        print(f"Fare: £{fare:.2f}")
    passengers = passengers + 1
    fares = fares + fare
    if passengers == CAPACITY:
        print("Full.")

print(f"Passengers: {passengers}")
print(f"Fares: £{fares:.2f}")
