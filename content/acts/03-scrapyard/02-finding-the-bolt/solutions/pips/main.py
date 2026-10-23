def find_bolt(sizes, size):
    low = 0
    high = len(sizes) - 1
    while low <= high:
        middle = (low + high) // 2
        if sizes[middle] == size:
            return middle
        elif sizes[middle] < size:
            low = middle + 1
        else:
            high = middle - 1
    return -1


rack = [3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30]
print("10 mm:", find_bolt(rack, 10))
print("30 mm:", find_bolt(rack, 30))
