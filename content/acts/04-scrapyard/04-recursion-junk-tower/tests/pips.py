TESTS = [
    function("Eight metres", call="pulls", args=(8,), expect=4, visible=True),
    function("Seven metres", call="pulls", args=(7,), expect=4, visible=True,
             hint="From 7 m the heights go 7, 5, 3, 1, then -1. The base case has to catch that last one too."),
    function("Already on the ground", call="pulls", args=(0,), expect=0,
             hint="A hook on the ground needs no pulls."),
    function("One metre", call="pulls", args=(1,), expect=1,
             hint="One metre up, one pull, and the hook stops on the ground."),
    function("Two metres", call="pulls", args=(2,), expect=1),
    function("Fifteen metres", call="pulls", args=(15,), expect=8),
    function("The top of the jib", call="pulls", args=(40,), expect=20),
]
