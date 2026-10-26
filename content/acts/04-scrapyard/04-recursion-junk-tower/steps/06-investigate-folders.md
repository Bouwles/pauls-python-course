---
id: investigate-folders
type: investigate
title: Folders inside folders
concept: recursion
dialogue:
  - nell: "Penhallow's disk. She copied it onto the yard computer and told me never to open it."
  - moss: "Then we'll only look at the outside of everything first."
code: |
  import os

  print(sorted(os.listdir("penhallow")))
  print(os.path.isdir("penhallow/yard"), os.path.isdir("penhallow/README.txt"))
  print(os.path.getsize("penhallow/README.txt"))


  def count_files(path):
      count = 0
      for name in os.listdir(path):
          inside = os.path.join(path, name)
          if os.path.isdir(inside):
              count = count + 1
          else:
              count = count + 1
      return count


  print(count_files("penhallow"))
tasks:
  - id: listed
    prompt: "Run it. How many names does `os.listdir` find in `penhallow`?"
    kind: answer
    accept: ["5", "five"]
    feedback: "Five: a README and four folders. `os.listdir` names what's in one folder and stops there, as opening one crate shows you only the top layer."
    wrong: "Count the names in the list on the first line."
  - id: bytes
    prompt: "How many bytes does `README.txt` hold?"
    kind: answer
    accept: ["89", "89 bytes"]
    feedback: "89: one byte for each letter, space and new line in it. A folder's size is all of its files' bytes added up, however deep they are."
    wrong: "It's the third line printed."
  - id: deeper
    prompt: "`count_files` counts each folder as one file, as if a crate were a part. Change one line so it counts every file however deep."
    kind: run
    tests: |
      TESTS = [output("Every file on the disk", expect="12", match="last_line",
                      hint="A folder inside adds whatever count_files gives back for it, not 1.")]
    solution: |
      import os

      print(sorted(os.listdir("penhallow")))
      print(os.path.isdir("penhallow/yard"), os.path.isdir("penhallow/README.txt"))
      print(os.path.getsize("penhallow/README.txt"))


      def count_files(path):
          count = 0
          for name in os.listdir(path):
              inside = os.path.join(path, name)
              if os.path.isdir(inside):
                  count = count + count_files(inside)
              else:
                  count = count + 1
          return count


      print(count_files("penhallow"))
  - id: visits
    prompt: "Add `print(path)` as the first line inside `count_files` and run it. How many folders does it visit, `penhallow` included?"
    kind: answer
    accept: ["9", "nine"]
    feedback: "Nine, each listed once. Each call opens one folder and hands every folder inside to another call, exactly like the junk tower."
    wrong: "Count the lines that start with penhallow, after the first three."
---
A folder is a crate. Its files are the parts, and the folders inside it are crates inside.

- `os.listdir(path)` gives the names of what's in one folder.
- `os.path.join(path, name)` builds the path to each, with the right slash.
- `os.path.isdir(inside)` says whether it's a folder.
- `os.path.getsize(inside)` gives a file's size in bytes.

The disk is in the `penhallow` folder beside the program.
