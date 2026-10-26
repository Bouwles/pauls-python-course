from track import ACTIONS, TILES, is_over, outcomes, show_values


def value_iteration(gamma=0.9, theta=1e-6):
    """The worth of every tile under the best possible policy."""
    values = {tile: 0.0 for tile in TILES}
    while True:
        biggest_change = 0
        for tile in TILES:
            if is_over(tile):
                continue
            best = max(
                reward + gamma * values[after]
                for action in ACTIONS
                for chance, after, reward, over in outcomes(tile, action)
            )
            biggest_change = max(biggest_change, abs(best - values[tile]))
            values[tile] = best
        if biggest_change < theta:
            return values


if __name__ == "__main__":
    show_values(value_iteration())
