"""Paul's whiteboard: three questions, the sort they ask at interviews."""
import heapq
from collections import deque


def pair_for(weights, target):
    """Positions (i, j), i < j, of two parts weighing target together, or None."""
    seen = {}
    for position, weight in enumerate(weights):
        if target - weight in seen:
            return seen[target - weight], position
        if weight not in seen:
            seen[weight] = position
    return None


def islands(grid):
    """How many separate islands of # there are in the drawing."""
    visited = set()
    count = 0
    for row in range(len(grid)):
        for col in range(len(grid[row])):
            if grid[row][col] != "#" or (row, col) in visited:
                continue
            count = count + 1
            visited.add((row, col))
            queue = deque([(row, col)])
            while queue:
                here_row, here_col = queue.popleft()
                for next_row, next_col in ((here_row - 1, here_col), (here_row + 1, here_col),
                                           (here_row, here_col - 1), (here_row, here_col + 1)):
                    if (0 <= next_row < len(grid) and 0 <= next_col < len(grid[next_row])
                            and grid[next_row][next_col] == "#" and (next_row, next_col) not in visited):
                        visited.add((next_row, next_col))
                        queue.append((next_row, next_col))
    return count


def merge_piles(piles):
    """One list of every weight in piles, each already lightest first, lightest first."""
    waiting = [(pile[0], number, 0) for number, pile in enumerate(piles) if pile]
    heapq.heapify(waiting)
    merged = []
    while waiting:
        weight, number, position = heapq.heappop(waiting)
        merged.append(weight)
        if position + 1 < len(piles[number]):
            heapq.heappush(waiting, (piles[number][position + 1], number, position + 1))
    return merged


if __name__ == "__main__":
    print(pair_for([12, 7, 30, 4, 19], 23))
    print(islands(["##..#", "#...#", "..#..", "##..."]))
    print(merge_piles([[1, 4, 9], [2, 3], [5, 8, 10]]))
