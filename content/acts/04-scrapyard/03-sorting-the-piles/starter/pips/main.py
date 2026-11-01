def quick_sort(pile):
    if len(pile) <= 1:
        return pile
    pivot = pile[0]
    faster = [lap for lap in pile if lap < pivot]
    slower = [lap for lap in pile if lap > pivot]
    return quick_sort(faster) + [pivot] + quick_sort(slower)


laps = [7, 3, 9, 7, 1, 7, 4]
print(quick_sort(laps))
