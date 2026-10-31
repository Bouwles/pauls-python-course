def errors(lines):
    for line in lines:
        if "| ERROR |" in line:
            yield line


log = [
    "06:12 | ERROR | printer | out of paper",
    "06:13 | INFO | server | backup done",
    "07:35 | ERROR | lights | bulb failed",
]

found = list(errors(log))
for line in found:
    print(line)
print(len(list(found)), "errors")
