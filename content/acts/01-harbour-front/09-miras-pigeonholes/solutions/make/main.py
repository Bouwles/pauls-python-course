# Mira's pigeonholes
# 1. Keep the items in a list (start empty, add each parcel until done)
parcels = []
name = input("Parcel for? ")
while name != "done":
    parcels.append(name)
    name = input("Parcel for? ")

# 2. Show every item with its index
for hole in range(len(parcels)):
    print(f"Hole {hole}: {parcels[hole]}")

# 3. Ask who's at the counter
person = input("At the counter? ")

# 4. Check it's there at all
if person in parcels:
    # 5. Find its index
    for hole in range(len(parcels)):
        if parcels[hole] == person:
            found = hole
    # 6. Take it out
    parcels.pop(found)
    print(f"Hole {found}.")
# 7. Say so if it isn't
else:
    print(f"Nothing for {person} today.")

# 8. Count what's left
print(f"Parcels left: {len(parcels)}")
