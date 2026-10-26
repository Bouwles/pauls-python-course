bill = float(input("Bill? "))
tip = float(input("Tip (%)? "))
total = bill * (1 + tip / 100)
print(f"Total with tip: {total:.2f}")
