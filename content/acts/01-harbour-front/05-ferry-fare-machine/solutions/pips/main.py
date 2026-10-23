hour = int(input("Hour of sailing? "))
if hour < 7 or hour >= 19:
    fare = 4.00
else:
    fare = 3.00
print(f"Adult fare: {fare:.2f}")
