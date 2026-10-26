def errors(lines):
    for line in lines:
        if "| ERROR |" in line:
            yield line


log = [
    "06:12 | ERROR | fog-horn | no air pressure",
    "06:13 | INFO | sea-wall | gate shut",
    "07:35 | ERROR | lamp | bulb failed",
]

found = errors(log)
for line in found:
    print(line)
print(len(list(found)), "errors")
