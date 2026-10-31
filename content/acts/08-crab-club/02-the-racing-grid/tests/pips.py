TESTS = [
    function("Four tiles, then the finish", call="discounted_return", args=([-1, -1, -1, -1, 10], 0.9), expect=3.122, tol=1e-6, visible=True),
    function("A good start, then a bad step", call="discounted_return", args=([10, -1], 0.5), expect=9.5, tol=1e-6, visible=True),
    function("A race with no steps", call="discounted_return", args=([], 0.9), expect=0, tol=1e-9),
    function("No discount at all", call="discounted_return", args=([1, 1, 1], 1.0), expect=3, tol=1e-9),
    function("Only the first reward counts", call="discounted_return", args=([3, 4], 0.0), expect=3, tol=1e-9,
             hint="With gamma 0, everything after the first reward is multiplied by 0. Which reward should be left?"),
    function("Penalties early, prize late", call="discounted_return", args=([-2, 0, 0, 8], 0.5), expect=-1.0, tol=1e-6),
    output("Yahya's practice race", expect="3.12"),
]
