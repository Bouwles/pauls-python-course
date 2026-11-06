---
id: make
type: make
title: Make the unit converter
on_pass: { neil.pleased: "Mach 2 up high, two thousand one hundred and twenty-four km/h. Same as my notes." }
hints:
  nudge: "Which question does the program ask first? And which option, only one, needs a second question?"
  plan:
    - Show the menu and ask
    - Choose what to do, one option at a time
    - Decide again inside the option that has a special case
    - Catch everything else
  shape: |
    print("1. Km/h to mph")
    print("2. Knots to km/h")
    print("3. Mach to km/h")
    choice = input("Choose 1, 2 or 3: ")
    if choice == ___:
        kmh = ___(input("Speed? "))
        print(f"That's {kmh / 1.609344:.2f} mph.")
    elif choice == ___:
        ___
    elif choice == ___:
        mach = float(input("Speed? "))
        sea_level = input("At sea level (yes or no)? ")
        if ___:
            kmh = mach * 1225
        else:
            kmh = ___
        print(f"That's {kmh:.2f} km/h.")
    else:
        print(___)
---
Write Neil's converter. It shows a menu, asks for a choice and a speed, and prints the answer with two decimal places:

- 1: km/h to mph. Divide by 1.609344.
- 2: knots to km/h. Multiply by 1.852.
- 3: Mach to km/h. Ask `At sea level (yes or no)? `. Mach 1 is 1225 km/h at sea level, and 1062 km/h high up, where the air is colder.
- Anything else: `No such option.`

```text
1. Km/h to mph
2. Knots to km/h
3. Mach to km/h
Choose 1, 2 or 3: 3
Speed? 2
At sea level (yes or no)? no
That's 2124.00 km/h.
```

Your file starts with Paul's four steps from the server-cost menu, as comments. Use `if`, `elif` and `else` for the menu, with the choices in quotes, and an `if` inside option 3 for its second question. The checks try every option, sea level and high up, and choices that aren't on the menu.
