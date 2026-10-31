TESTS = [
    function("Jon Hale since spring", call="changes", args=((112, 98, 84), (113, 100, 84)), expect=(1, 2, 0), visible=True),
    function("Two numbers went down", call="changes", args=((96, 88, 74), (95, 86, 74)), expect=(-1, -2, 0)),
    function("Nothing changed", call="changes", args=((101, 95, 79), (101, 95, 79)), expect=(0, 0, 0)),
]
