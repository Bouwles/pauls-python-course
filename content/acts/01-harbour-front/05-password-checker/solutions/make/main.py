# Password checker for the class's shared accounts. Aaesha's six rules:
# 1. At least 10 characters.
# 2. At least one capital and one lower-case letter.
# 3. Not only letters.
# 4. The username isn't inside it, in any case.
# 5. The word password isn't inside it, even with a 0 for the o.
# 6. It doesn't end in four digits.

# Ask, then tidy what was typed
username = input("Username? ").strip().lower()
password = input("Password? ")

# Assume it passes until a rule says otherwise
ok = True

# Check each rule on its own, with a reason
if len(password) < 10:
    print("Too short: at least 10 characters.")
    ok = False
if password == password.lower() or password == password.upper():
    print("Needs capitals and lower case.")
    ok = False
if password.isalpha():
    print("Needs a number or a symbol.")
    ok = False
if username in password.lower():
    print("Contains your username.")
    ok = False
if "password" in password.lower().replace("0", "o"):
    print("Contains the word password.")
    ok = False
if password[-4:].isdigit():
    print("Ends in a year.")
    ok = False

# Give the verdict once, at the end
if ok:
    print("Password accepted.")
else:
    print("Password rejected.")
