TESTS = [
    output("Four questions, not five", inputs=["Tom", "1987", "blue", "Sir Reginald"],
           expect="Right.\nRight.\nNo. It was green.\nRight.\nYou scored 3 out of 4.\nRespectable.", visible=True),
    function("is_correct still works", call="is_correct", args=(" tom", "Tom"), expect=True),
]
