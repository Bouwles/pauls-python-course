total = 0
count = 0
thickest = 0

reading = input("Visibility in metres? ")
while reading != "clear":
    metres = int(reading)
    if count == 0 or metres < thickest:
        thickest = metres
    total = total + metres
    count = count + 1
    reading = input("Visibility in metres? ")

if count == 0:
    print("No fog tonight.")
else:
    print(f"Readings: {count}")
    print(f"Average: {total / count:.1f} metres")
    print(f"Thickest: {thickest} metres")
