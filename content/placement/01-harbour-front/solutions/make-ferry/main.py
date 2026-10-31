# Riya's ticket desk for the clock tour. Twelve on the stairs at a time.
# Under 5: free. 5 to 15: 1.50. 16 to 64: 3.20. 65 and over: 2.00.
CAPACITY = 12

visitors = 0
total = 0.0
while visitors < CAPACITY:
    answer = input("Age? ").strip()
    if answer == "":
        break
    if not answer.isdigit():
        print("Ages are whole numbers.")
        continue
    age = int(answer)
    if age < 5:
        price = 0.0
    elif age <= 15:
        price = 1.50
    elif age <= 64:
        price = 3.20
    else:
        price = 2.00
    if price == 0:
        print("Ticket: free")
    else:
        print(f"Ticket: £{price:.2f}")
    visitors = visitors + 1
    total = total + price
    if visitors == CAPACITY:
        print("Full.")

print(f"Visitors: {visitors}")
print(f"Total: £{total:.2f}")
