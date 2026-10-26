username = input("Username? ").strip().lower()
password = input("Password? ")

ok = True
passphrase = len(password) >= 20

if len(password) < 10:
    print("Too short: at least 10 characters.")
    ok = False
if not passphrase and (password == password.lower() or password == password.upper()):
    print("Needs capitals and lower case.")
    ok = False
if not passphrase and password.isalpha():
    print("Needs a number or a symbol.")
    ok = False
if username in password.lower():
    print("Contains your username.")
    ok = False
if "password" in password.lower().replace("0", "o"):
    print("Contains the word password.")
    ok = False
if not passphrase and password[-4:].isdigit():
    print("Ends in a year.")
    ok = False

if ok:
    print("Password accepted.")
else:
    print("Password rejected.")
