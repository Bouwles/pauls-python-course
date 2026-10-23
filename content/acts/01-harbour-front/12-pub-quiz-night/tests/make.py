FULL = "Full marks. Gwen is checking your sleeves."
NONE_RIGHT = "Not one. Impressive, in its way."

TESTS = [
    function("is_correct(\"Tom\", \"Tom\")", call="is_correct", args=("Tom", "Tom"), expect=True, visible=True),
    output("A typical Tuesday", inputs=["old tom", "1987", "Green", " 1987", "sir reginald"],
           expect="No. It was Tom.\nRight.\nRight.\nRight.\nRight.\nYou scored 4 out of 5.\nRespectable.", visible=True),
    function("A wrong answer", call="is_correct", args=("1986", "1987"), expect=False),
    function("Capitals and spaces don't count", call="is_correct", args=("  SIR reginald ", "Sir Reginald"), expect=True,
             hint="Strip the spaces off the ends of what was typed, and compare both in lower case."),
    function("verdict(5, 5)", call="verdict", args=(5, 5), expect=FULL),
    function("verdict(1, 5)", call="verdict", args=(1, 5), expect="There's always next Tuesday."),
    function("Exactly half", call="verdict", args=(2, 4), expect="Respectable.",
             hint="At least half is respectable, and 2 out of 4 is exactly half."),
    function("None right", call="verdict", args=(0, 5), expect=NONE_RIGHT,
             hint="Zero is also fewer than half. Check for zero before that, so it gets its own remark."),
    function("A ten-question night", call="verdict", args=(10, 10), expect=FULL,
             hint="Compare the score with total, not with 5. Some nights have more questions."),
    output("Full marks", inputs=["Tom", "1987", "green", "1987", "Sir Reginald"],
           expect="Right.\nRight.\nRight.\nRight.\nRight.\nYou scored 5 out of 5.\n" + FULL),
    output("A bad night", inputs=["Old Tom", "1988", "red", "1988", "Reggie"],
           expect="No. It was Tom.\nNo. It was 1987.\nNo. It was green.\nNo. It was 1987.\nNo. It was Sir Reginald.\nYou scored 0 out of 5.\n" + NONE_RIGHT),
]
