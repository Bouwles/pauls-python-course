# Ferro's fare machine
# 1. Ask for the numbers
age = int(input("Age? "))
hour = int(input("Hour of sailing? "))

# 2. Choose the band, youngest first
if age < 5:
    fare = 0.00
elif age < 16:
    fare = 1.50
elif age < 65:
    # 3. Decide again inside the band that has a special case
    if hour < 7 or hour >= 19:
        fare = 4.00
    else:
        fare = 3.00
# 4. Catch everything else
else:
    fare = 1.50

# 5. Show the result
print(f"Fare: {fare:.2f}")
