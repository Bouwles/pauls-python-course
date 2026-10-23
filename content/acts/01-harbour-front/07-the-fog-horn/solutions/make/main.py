# Fog log. Visibility in metres, read off the buoys.
# Tom rounds up. Let him; he has earned it.
# On a clear night you can see the hill from the gallery.
# The hill can see a good deal further. That was the idea. A.P.

# 1. Start the totals at zero
total = 0
count = 0

# 2. Ask before the loop
reading = input("Visibility in metres? ")

# 3. Loop until the sentinel
while reading != "clear":
    # 4. Add to the totals
    total = total + int(reading)
    count = count + 1
    # 5. Ask again at the bottom
    reading = input("Visibility in metres? ")

# 6. Report after the loop
if count == 0:
    print("No fog tonight.")
else:
    print(f"Readings: {count}")
    print(f"Average: {total / count:.1f} metres")
