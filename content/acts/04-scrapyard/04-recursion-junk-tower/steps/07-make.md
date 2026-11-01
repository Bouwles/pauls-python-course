---
id: make
type: make
title: Make the file tree printer
files: [tree.py]
entry: tree.py
argv_field: true
on_pass: { neil.laughing.cheer: "Four folders deep. I'd have said three, and I'd have said it confidently." }
hints:
  nudge: "What's the answer for an empty folder? How does a folder's answer come from the answers for the folders inside it? And for `tree_lines`, what changes in front of the lines one folder further in?"
  plan:
    - "folder_size: worked out before? Hand that back"
    - Otherwise, work it out from what's inside
    - Write it down, then hand it back
    - "count_files and depth: the same shape, adding 1 a file, or one more than the deepest folder inside"
    - "tree_lines: for each name, sorted, a line with ├── or └── and a size; for a folder, its own lines underneath, with the prefix grown"
  shape: |
    def folder_size(path, sizes):
        if path in sizes:
            return ___
        total = 0
        for name in sorted(os.listdir(path)):
            ...
        sizes[path] = ___
        return total


    def tree_lines(path, sizes, prefix=""):
        lines = []
        names = sorted(os.listdir(path))
        for position, name in enumerate(names):
            inside = os.path.join(path, name)
            last = position == ___
            branch = "└── " if last else "├── "
            if os.path.isdir(inside):
                lines.append(f"{prefix}{branch}{name}/ ({folder_size(inside, sizes)} bytes)")
                lines.extend(tree_lines(inside, sizes, prefix + ___))
            else:
                lines.append(___)
        return lines
---
Write the printer in `tree.py`. Neil's `folder_size` is there: right, and wasteful. The printer shows every folder's size, so `versions` is measured for itself, then again for `lap-timer`, `karting` and `backup`. Memoise it: `sizes` is the book to write each folder's total in, filed by its path, and read first. Paul's subgoals are the plan.

```
backup/ (835 bytes)
├── README.txt (94 bytes)
├── karting/ (204 bytes)
│   └── lap-timer/ (204 bytes)
│       ├── notes.txt (70 bytes)
```

Then `count_files`, `depth` and `tree_lines`. Under a folder, the lines get the prefix plus `│` and three spaces, or four spaces if the folder was the last thing in its own folder.

The main block prints whatever folder is in the Arguments box. The hidden checks build folders of their own, empty and deep, and count every `os.listdir`.
