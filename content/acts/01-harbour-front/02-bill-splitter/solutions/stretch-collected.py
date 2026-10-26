# Bea's bill splitter
# 1. Ask for the text
bill = input("Bill? ")
people = input("People? ")
tip = input("Tip (%)? ")

# 2. Turn the text into numbers
bill = float(bill)
people = int(people)
tip = float(tip)

# 3. Work out the answer
total = bill * (1 + tip / 100)
each = total / people
collected = round(each, 2) * people

# 4. Show it, rounded
print(f"Total with tip: {total:.2f}")
print(f"Each pays: {each:.2f}")
print(f"Collected: {collected:.2f}")
