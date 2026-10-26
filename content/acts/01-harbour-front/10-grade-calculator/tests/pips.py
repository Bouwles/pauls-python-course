TESTS = [
    output("Sanjay's line", expect="Sanjay: 53.7 (C)", visible=True,
           hint="A None in the brackets, and a stray letter above, mean grade printed when it should have returned."),
    function("grade(75)", call="grade", args=(75,), expect="A"),
    function("grade(45)", call="grade", args=(45,), expect="D",
             hint="grade has to hand the letter back with return, so the caller gets it."),
    function("grade(12)", call="grade", args=(12,), expect="F"),
]
