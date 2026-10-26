---
id: make
type: make
title: Make the unit converter
on_pass: { ferro: "Eleven sea miles, twenty point three seven kilometres. Same as the chart." }
hints:
  nudge: "Which question does the program ask first? And which option, only one, needs a second question?"
  plan:
    - Show the menu and ask
    - Choose what to do, one option at a time
    - Decide again inside the option that has a special case
    - Catch everything else
  shape: |
    print("1. Knots to mph")
    print("2. Knots to km/h")
    print("3. Miles to km")
    choice = input("Choose 1, 2 or 3: ")
    if choice == ___:
        knots = ___(input("How many? "))
        print(f"That's {knots * 1.15078:.2f} mph.")
    elif choice == ___:
        ___
    elif choice == ___:
        miles = float(input("How many? "))
        sea = input("Sea miles (yes or no)? ")
        if ___:
            km = miles * 1.852
        else:
            km = ___
        print(f"That's {km:.2f} km.")
    else:
        print(___)
---
Write Ferro's converter.

- 1: knots to mph. One knot is 1.15078 mph.
- 2: knots to km/h. One knot is 1.852 km/h.
- 3: miles to km. Ask `Sea miles (yes or no)? `. A sea mile is 1.852 km, a land mile 1.609344 km.
- Anything else: `No such option.`

```
1. Knots to mph
2. Knots to km/h
3. Miles to km
Choose 1, 2 or 3: 3
How many? 11
Sea miles (yes or no)? yes
That's 20.37 km.
```

The comments in the file are Moss's labels from Mira's postage. The checks try every option, sea and land, and a choice that isn't on the menu.
