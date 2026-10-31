# Lap times in seconds, until I type stop. Y.
total = 0
count = 0
lap = input("Lap time in seconds? ")
while lap != "stop":
    total = total + int(lap)
    count = count + 1
print(f"Laps: {count}")
print(f"Average: {total / count:.1f} seconds")
