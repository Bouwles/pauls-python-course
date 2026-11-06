---
id: learn-kwargs
type: learn
title: Any number of options
concept: args-kwargs
code: |
  def order(drink, **extras):
      print(drink, extras)

  order("tea", milk=True, sugar=2)
  order("coffee")

  usual = {"milk": False, "sugar": 1}
  order("tea", **usual)
---
Two stars, as in `**extras`, gather keyword arguments instead. Every named argument that matches no other parameter goes into `extras`, a dictionary of names and values.

In a call, `**` works the other way round. `order("tea", **usual)` spreads a dictionary back out into keyword arguments, one for each key. So a function can take options it knows nothing about and pass them straight on to another function. Caitlin's `make_passwords` will pass its options on to `make_password` like this.

The example prints `tea {'milk': True, 'sugar': 2}`, then `coffee {}`, then `tea {'milk': False, 'sugar': 1}`.

The usual slip is to expect only the values, `True` and `2`. The names are kept too, as the keys.
