def errors(lines):
    for line in lines:
        if "| ERROR |" in line:
            yield line


log = [
    "06:12 | ERROR | brakes | overheating",
    "06:13 | INFO | fuel | on target",
    "07:35 | ERROR | tyres | puncture",
]

found = errors(log)
for line in found:
    print(line)
print(len(list(found)), "errors")
