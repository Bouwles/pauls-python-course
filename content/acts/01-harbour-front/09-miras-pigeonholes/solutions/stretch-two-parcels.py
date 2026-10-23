parcels = []
name = input("Parcel for? ")
while name != "done":
    parcels.append(name)
    name = input("Parcel for? ")

for hole in range(len(parcels)):
    print(f"Hole {hole}: {parcels[hole]}")

person = input("At the counter? ")
if person in parcels:
    for hole in range(len(parcels)):
        if parcels[hole] == person:
            found = hole
            break
    parcels.pop(found)
    print(f"Hole {found}.")
else:
    print(f"Nothing for {person} today.")

print(f"Parcels left: {len(parcels)}")
