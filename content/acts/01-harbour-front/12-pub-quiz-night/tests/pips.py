TESTS = [
    output("Three out of five", expect="You scored 3 out of 5.\nRespectable.", visible=True,
           hint="A None on the last line means something printed when it should have returned."),
    function("verdict(3, 5)", call="verdict", args=(3, 5), expect="Respectable."),
    function("verdict(1, 5)", call="verdict", args=(1, 5), expect="There's always next Tuesday.",
             hint="verdict has to hand the remark back with return, so the caller gets the words."),
]
