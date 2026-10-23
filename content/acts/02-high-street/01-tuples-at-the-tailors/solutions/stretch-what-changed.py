def changes(old, new):
    differences = []
    for before, after in zip(old, new):
        differences.append(after - before)
    return tuple(differences)
