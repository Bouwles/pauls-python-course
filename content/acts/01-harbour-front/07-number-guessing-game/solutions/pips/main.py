# Weather station readings, in degrees, until I type stop. Y.
total = 0
count = 0
reading = input("Reading? ")
while reading != "stop":
    total = total + int(reading)
    count = count + 1
    reading = input("Reading? ")
print(f"Readings: {count}")
print(f"Average: {total / count:.1f} degrees")
