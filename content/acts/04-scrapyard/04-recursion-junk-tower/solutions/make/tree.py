"""Recursive File Tree Printer: a folder and everything in it, drawn the way `tree` draws it."""
import os
import sys

FOLDER = "backup"


# Folder sizes, from Neil's old backup script. It adds up every file in a folder,
# and every folder above asks again, so the same small folders get measured over
# and over. It writes nothing down.
def folder_size(path, sizes):
    """Bytes in every file under path, however deep. Each folder's total is kept in sizes."""
    # Worked out before? Hand that back
    if path in sizes:
        return sizes[path]
    # Otherwise, work it out from what's inside
    total = 0
    for name in sorted(os.listdir(path)):
        inside = os.path.join(path, name)
        if os.path.isdir(inside):
            total = total + folder_size(inside, sizes)
        else:
            total = total + os.path.getsize(inside)
    # Write it down, then hand it back
    sizes[path] = total
    return total


def count_files(path):
    """How many files are under path, however deep."""
    count = 0
    for name in os.listdir(path):
        inside = os.path.join(path, name)
        if os.path.isdir(inside):
            count = count + count_files(inside)
        else:
            count = count + 1
    return count


def depth(path):
    """How many folders deep: 1 for a folder with no folders inside."""
    deepest_inside = 0
    for name in os.listdir(path):
        inside = os.path.join(path, name)
        if os.path.isdir(inside):
            deepest_inside = max(deepest_inside, depth(inside))
    return 1 + deepest_inside


def tree_lines(path, sizes, prefix=""):
    """A line for everything inside path, in order, with branches, and a size for each."""
    lines = []
    names = sorted(os.listdir(path))
    for position, name in enumerate(names):
        inside = os.path.join(path, name)
        last = position == len(names) - 1
        branch = "└── " if last else "├── "
        if os.path.isdir(inside):
            lines.append(f"{prefix}{branch}{name}/ ({folder_size(inside, sizes)} bytes)")
            lines.extend(tree_lines(inside, sizes, prefix + ("    " if last else "│   ")))
        else:
            lines.append(f"{prefix}{branch}{name} ({os.path.getsize(inside)} bytes)")
    return lines


if __name__ == "__main__":
    folder = sys.argv[1] if len(sys.argv) > 1 else FOLDER
    sizes = {}
    print(f"{folder}/ ({folder_size(folder, sizes)} bytes)")
    for line in tree_lines(folder, sizes):
        print(line)
    print(f"{count_files(folder)} files, {depth(folder)} folders deep")
