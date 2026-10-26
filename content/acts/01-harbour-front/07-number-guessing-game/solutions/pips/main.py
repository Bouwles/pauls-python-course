# Fog log. Visibility in metres, read off the buoys.
# Tom rounds up. Let him; he has earned it.
# On a clear night you can see the hill from the gallery.
# The hill can see a good deal further. That was the idea. A.P.
total = 0
count = 0
reading = input("Visibility in metres? ")
while reading != "clear":
    total = total + int(reading)
    count = count + 1
    reading = input("Visibility in metres? ")
print(f"Readings: {count}")
print(f"Average: {total / count:.1f} metres")
