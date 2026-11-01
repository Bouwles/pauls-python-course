import os as _os

PRINTED = """backup/ (835 bytes)
├── README.txt (94 bytes)
├── karting/ (204 bytes)
│   └── lap-timer/ (204 bytes)
│       ├── notes.txt (70 bytes)
│       └── versions/ (134 bytes)
│           ├── v1.txt (73 bytes)
│           └── v2.txt (61 bytes)
├── rockets/ (258 bytes)
│   ├── checklist.txt (63 bytes)
│   ├── design.txt (72 bytes)
│   └── flights/ (123 bytes)
│       ├── first.txt (60 bytes)
│       └── second.txt (63 bytes)
├── scripts/ (188 bytes)
│   ├── style/ (116 bytes)
│   │   ├── spaces.txt (92 bytes)
│   │   └── tabs.txt (24 bytes)
│   └── telemetry.txt (72 bytes)
└── teaching/ (91 bytes)
    └── duck.txt (91 bytes)
12 files, 4 folders deep"""

ROCKETS = """backup/rockets/ (258 bytes)
├── checklist.txt (63 bytes)
├── design.txt (72 bytes)
└── flights/ (123 bytes)
    ├── first.txt (60 bytes)
    └── second.txt (63 bytes)
4 files, 2 folders deep"""


def make_tree(root, layout):
    """Build folders and files from a dict: a str is a file's text, a dict is a folder."""
    _os.makedirs(root, exist_ok=True)
    for name, thing in layout.items():
        path = _os.path.join(root, name)
        if isinstance(thing, dict):
            make_tree(path, thing)
        else:
            with open(path, "w") as file:
                file.write(thing)
    return root


def measured(path):
    total = 0
    for folder, _folders, files in _os.walk(path):
        for name in files:
            total += _os.path.getsize(_os.path.join(folder, name))
    return total


class Listings:
    """Counts every os.listdir call, by folder."""

    def __enter__(self):
        self.calls = {}
        self.real = _os.listdir

        def counted(path="."):
            key = _os.path.normpath(path)
            self.calls[key] = self.calls.get(key, 0) + 1
            return self.real(path)

        _os.listdir = counted
        return self

    def __exit__(self, *problem):
        _os.listdir = self.real


def disk_size(ctx):
    got = ctx.module().folder_size("backup", {})
    if got != measured("backup"):
        raise CheckFailed("folder_size should add up the bytes of every file under the folder, however deep.",
                          expected=measured("backup"), actual=got)


def counts_and_depth(ctx):
    module = ctx.module()
    if module.count_files("backup") != 12:
        raise CheckFailed("Neil's backup holds twelve files.", expected=12, actual=module.count_files("backup"))
    if module.depth("backup") != 4:
        raise CheckFailed("backup, karting, lap-timer, versions: four folders deep.", expected=4, actual=module.depth("backup"))


def empty_folder(ctx):
    module = ctx.module()
    root = make_tree("/tmp/tree-checks/empty", {})
    got = (module.folder_size(root, {}), module.count_files(root), module.depth(root), module.tree_lines(root, {}))
    if got != (0, 0, 1, []):
        raise CheckFailed("An empty folder: 0 bytes, 0 files, 1 folder deep, and no lines.", expected=(0, 0, 1, []), actual=got)


def folders_of_folders(ctx):
    module = ctx.module()
    root = make_tree("/tmp/tree-checks/nested", {"a": {"b": {}, "c": {"d": {}}}})
    got = (module.folder_size(root, {}), module.count_files(root), module.depth(root))
    if got != (0, 0, 4):
        raise CheckFailed("Folders with nothing but folders in: 0 bytes, 0 files, and 4 deep.", expected=(0, 0, 4), actual=got)


def deep_tree(ctx):
    module = ctx.module()
    layout = {"note.txt": "x"}
    for _ in range(150):
        layout = {"d": layout, "note.txt": "x"}
    root = make_tree("/tmp/tree-checks/deep", layout)
    got = (module.folder_size(root, {}), module.count_files(root), module.depth(root))
    if got != (151, 151, 151):
        raise CheckFailed("151 folders inside each other, with a 1-byte file in each.", expected=(151, 151, 151), actual=got)


def small_tree_lines(ctx):
    root = make_tree("/tmp/tree-checks/small", {"b.txt": "four", "a": {"x.txt": "xx", "y": {"z.txt": "zzz"}}, "c": {}})
    got = ctx.module().tree_lines(root, {})
    expected = [
        "├── a/ (5 bytes)",
        "│   ├── x.txt (2 bytes)",
        "│   └── y/ (3 bytes)",
        "│       └── z.txt (3 bytes)",
        "├── b.txt (4 bytes)",
        "└── c/ (0 bytes)",
    ]
    if got != expected:
        raise CheckFailed("tree_lines on a small folder gives the wrong lines.", expected="\n".join(expected), actual="\n".join(map(str, got or [])))


def last_branch_has_no_rail(ctx):
    root = make_tree("/tmp/tree-checks/last", {"a.txt": "a", "z": {"inner.txt": "ii", "more": {"deep.txt": "d"}}})
    got = ctx.module().tree_lines(root, {})
    expected = [
        "├── a.txt (1 bytes)",
        "└── z/ (3 bytes)",
        "    ├── inner.txt (2 bytes)",
        "    └── more/ (1 bytes)",
        "        └── deep.txt (1 bytes)",
    ]
    if got != expected:
        raise CheckFailed("Under the last thing in a folder, the rail stops: four spaces, not a │.", expected="\n".join(expected), actual="\n".join(map(str, got or [])))


def measured_once(ctx):
    module = ctx.module()
    sizes = {}
    with Listings() as listings:
        module.folder_size("backup", sizes)
    if not listings.calls:
        raise CheckFailed("folder_size should look inside folders with os.listdir.")
    twice = sorted(path for path, count in listings.calls.items() if count > 1)
    if twice:
        raise CheckFailed("folder_size listed some folders more than once.", actual=", ".join(twice))
    folders = sorted(_os.path.normpath(folder) for folder, _sub, _files in _os.walk("backup"))
    kept = sorted(_os.path.normpath(path) for path in sizes)
    if kept != folders:
        raise CheckFailed("After folder_size, sizes should hold the total of every folder it measured, filed by its path.",
                          expected=folders, actual=kept)


def printed_with_memory(ctx):
    module = ctx.module()
    sizes = {}
    with Listings() as listings:
        module.folder_size("backup", sizes)
        module.tree_lines("backup", sizes)
    worst = max(listings.calls.values()) if listings.calls else 0
    if worst > 2:
        busiest = max(listings.calls, key=listings.calls.get)
        raise CheckFailed(f"Printing the tree listed {busiest} {worst} times. With every folder's size written down, each folder is listed once to measure it and once to print it.",
                          expected="2 or fewer", actual=worst)


def reads_the_book_first(ctx):
    module = ctx.module()
    with Listings() as listings:
        got = module.folder_size("backup", {"backup": 12345})
    if got != 12345 or listings.calls:
        raise CheckFailed("If sizes already holds a folder's total, hand that back without looking inside.",
                          expected="12345, and no os.listdir", actual=f"{got}, {sum(listings.calls.values())} listings")


TESTS = [
    output("Neil's backup", expect=PRINTED, visible=True),
    custom("The whole backup's size", disk_size, visible=True),
    custom("Files and depth", counts_and_depth,
           hint="count_files and depth have folder_size's shape: deal with the files you can see, and hand each folder inside to the same function."),
    custom("An empty folder", empty_folder,
           hint="A folder with nothing in it: no bytes, no files, and it's 1 folder deep, itself. tree_lines gives back an empty list."),
    custom("Folders and nothing else", folders_of_folders),
    custom("A hundred and fifty-one folders deep", deep_tree),
    custom("A small tree, line by line", small_tree_lines,
           hint="Sorted names. ├── for each but the last, └── for the last. A folder shows name/, a file name, each with its size in brackets."),
    custom("Under the last branch", last_branch_has_no_rail,
           hint="What goes in front of the lines inside a folder is the prefix plus │ and three spaces, or four spaces if the folder was the last."),
    custom("Each folder measured once", measured_once,
           hint="Neil's folder_size works every folder out from scratch. Look in sizes first, and write each total in before handing it back."),
    custom("The tree printed from memory", printed_with_memory,
           hint="tree_lines asks folder_size about every folder. Pass the same sizes along, so the answers are read, not measured again."),
    custom("Sizes already written down", reads_the_book_first),
    output("Any folder you name", argv=["backup/rockets"], expect=ROCKETS,
           hint="The main block prints whatever folder is named in sys.argv. Nothing about the backup should be written in."),
]
