track = input("Track? ")
temp = int(input("Track temperature? "))
if track == "dry":
    if temp < 40:
        print("Soft tyres")
    else:
        print("Hard tyres. Too hot for softs.")
else:
    print("Wet tyres. Whatever the temperature.")
