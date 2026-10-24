# Knowing the track: the worth of every tile, worked out without a single race.

from track import ACTIONS, TILES, TRADITIONAL, draw, is_over, outcomes, show_policy, show_values


def q_value(values, tile, action, gamma=0.9):
    """What action is worth on tile: for each outcome, its reward plus gamma times
    the worth of where it leads (nothing, if the race is over), weighted by its chance."""
    total = 0
    for chance, after, reward, over in outcomes(tile, action):
        future = 0 if over else gamma * values[after]
        total += chance * (reward + future)
    return total


def evaluate(policy, gamma=0.9, theta=1e-6):
    """The worth of every tile, following policy. The finish and the pool stay at 0."""
    values = {tile: 0.0 for tile in TILES}
    while True:
        biggest_change = 0
        for tile in TILES:
            if is_over(tile):
                continue
            new = q_value(values, tile, policy[tile], gamma)
            biggest_change = max(biggest_change, abs(new - values[tile]))
            values[tile] = new
        if biggest_change < theta:
            return values


def greedy(values, gamma=0.9):
    """The best action on every tile where the race isn't over, looking one step ahead."""
    return {tile: max(ACTIONS, key=lambda action: q_value(values, tile, action, gamma))
            for tile in TILES if not is_over(tile)}


def value_iteration(gamma=0.9, theta=1e-6):
    """The worth of every tile under the best possible policy."""
    values = {tile: 0.0 for tile in TILES}
    sweep = 0
    while True:
        sweep += 1
        biggest_change = 0
        for tile in TILES:
            if is_over(tile):
                continue
            new = max(q_value(values, tile, action, gamma) for action in ACTIONS)
            biggest_change = max(biggest_change, abs(new - values[tile]))
            values[tile] = new
        draw(values, greedy(values, gamma), title=f"value iteration, sweep {sweep}")
        if biggest_change < theta:
            return values


def policy_iteration(policy, gamma=0.9):
    """Evaluate, improve, repeat, until the policy stops changing. Returns (policy, values)."""
    while True:
        values = evaluate(policy, gamma)
        better = greedy(values, gamma)
        if better == policy:
            return policy, values
        policy = better


if __name__ == "__main__":
    print("The traditional line")
    show_values(evaluate(TRADITIONAL))
    print()
    best_values = value_iteration()
    print("The best line")
    show_values(best_values)
    show_policy(greedy(best_values))
    print()
    best_policy, _ = policy_iteration(TRADITIONAL)
    print("Policy iteration agrees:", best_policy == greedy(best_values))
