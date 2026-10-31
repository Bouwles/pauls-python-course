---
id: make
type: make
title: Make the unit converter
on_pass: { yahya: "Twelve outdoor laps, four point eight kilometres. Same as my watch." }
hints:
  nudge: "Which question does the program ask first? And which option, only one, needs a second question?"
  plan:
    - Show the menu and ask
    - Choose what to do, one option at a time
    - Decide again inside the option that has a special case
    - Catch everything else
  shape: |
    print("1. Km to miles")
    print("2. Min per km to min per mile")
    print("3. Laps to km")
    choice = input("Choose 1, 2 or 3: ")
    if choice == ___:
        km = ___(input("How many? "))
        print(f"That's {km / 1.609344:.2f} miles.")
    elif choice == ___:
        ___
    elif choice == ___:
        laps = float(input("How many? "))
        indoor = input("Indoor track (yes or no)? ")
        if ___:
            km = laps * 0.2
        else:
            km = ___
        print(f"That's {km:.2f} km.")
    else:
        print(___)
---
Write Yahya's converter.

- 1: km to miles. Divide by 1.609344.
- 2: minutes per km to minutes per mile. Multiply by 1.609344.
- 3: laps to km. Ask `Indoor track (yes or no)? `. An indoor lap is 0.2 km, an outdoor lap 0.4 km.
- Anything else: `No such option.`

```
1. Km to miles
2. Min per km to min per mile
3. Laps to km
Choose 1, 2 or 3: 3
How many? 12
Indoor track (yes or no)? no
That's 4.80 km.
```

The comments in the file are Paul's labels from the postage. The checks try every option, indoor and outdoor, and a choice that isn't on the menu.
