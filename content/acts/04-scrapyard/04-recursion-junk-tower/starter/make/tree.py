"""Recursive File Tree Printer: a folder and everything in it, drawn the way `tree` draws it."""
import os
import sys

FOLDER = "penhallow"


# Folder sizes, from Penhallow's disk program. It adds up every file in a folder,
# and every folder above asks again, so the same small folders get measured over
# and over. It writes nothing down. The machine on the hill writes everything
# down and never works anything out twice. Between the two of them, there's one
# sensible program. A.P.
def folder_size(path, sizes):
    """Bytes in every file under path, however deep. Each folder's total is kept in sizes."""
    total = 0
    for name in sorted(os.listdir(path)):
        inside = os.path.join(path, name)
        if os.path.isdir(inside):
            total = total + folder_size(inside, sizes)
        else:
            total = total + os.path.getsize(inside)
    return total


def count_files(path):
    """How many files are under path, however deep."""


def depth(path):
    """How many folders deep: 1 for a folder with no folders inside."""


def tree_lines(path, sizes, prefix=""):
    """A line for everything inside path, in order, with branches, and a size for each."""


if __name__ == "__main__":
    folder = sys.argv[1] if len(sys.argv) > 1 else FOLDER
    sizes = {}
    print(f"{folder}/ ({folder_size(folder, sizes)} bytes)")
    for line in tree_lines(folder, sizes):
        print(line)
    print(f"{count_files(folder)} files, {depth(folder)} folders deep")
