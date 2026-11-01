TESTS = [
    output("Caitlin's list", expect="['red scarf', 'umbrella']", visible=True,
           hint="Empty curly brackets make a dict. An empty set is written set()."),
    function("A hat three times", call="repeats", args=(["hat", "hat", "hat", "glove"],), expect={"hat"}),
    function("Nothing repeated", call="repeats", args=(["glove", "hat"],), expect=set(),
             hint="With nothing repeated, repeats should give back an empty set."),
]
