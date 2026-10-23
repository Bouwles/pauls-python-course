total = 0
count = 0
reading = input("Visibility in metres? ")
while reading != "clear":
    total = total + int(reading)
    count = count + 1
print(f"Readings: {count}")
print(f"Average: {total / count:.1f} metres")
