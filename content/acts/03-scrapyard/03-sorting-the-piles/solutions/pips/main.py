def quick_sort(pile):
    if len(pile) <= 1:
        return pile
    pivot = pile[0]
    lighter = [weight for weight in pile if weight < pivot]
    same = [weight for weight in pile if weight == pivot]
    heavier = [weight for weight in pile if weight > pivot]
    return quick_sort(lighter) + same + quick_sort(heavier)


engines = [7, 3, 9, 7, 1, 7, 4]
print(quick_sort(engines))
