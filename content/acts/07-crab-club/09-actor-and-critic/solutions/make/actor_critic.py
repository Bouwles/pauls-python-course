# Actor and critic: Sir Reginald acts, and the critic judges every move as it happens.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, is_over, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def chances(theta, tile):
    """The softmax of the tile's four preferences, from Learning the Policy Directly."""
    prefs = theta[tile]
    weights = np.exp(prefs - prefs.max())
    return weights / weights.sum()


def grad_log_chance(theta, tile, action):
    """The gradient of log(chance of action on tile), from Learning the Policy Directly."""
    grad = np.zeros_like(theta)
    grad[tile] = -chances(theta, tile)
    grad[tile][action] += 1
    return grad


def td_error(values, tile, reward, after, over, gamma=0.9):
    """The critic's verdict on one move: how much better it went than the critic expected."""
    future = 0.0 if over else gamma * values[after]
    return reward + future - values[tile]


def update(theta, values, tile, action, reward, after, over, gamma=0.9, actor_rate=0.2, critic_rate=0.2):
    """One step of actor-critic, in place. Returns the TD error."""
    # The critic's verdict, and which way makes this move likelier, before anything changes
    error = td_error(values, tile, reward, after, over, gamma)
    grad = grad_log_chance(theta, tile, action)
    # The critic learns what the tile is worth
    values[tile] += critic_rate * error
    # The actor makes the move likelier if it beat the critic's expectation
    theta += actor_rate * error * grad
    return error


def train(episodes, rng, gamma=0.9, actor_rate=0.2, critic_rate=0.2, watch=False):
    """Actor-critic on the racing grid, learning after every move. Returns (theta, values)."""
    theta = np.zeros((ROWS, COLS, 4))
    values = np.zeros((ROWS, COLS))
    for episode in range(episodes):
        tile = START
        for _ in range(50):
            # Pick by chance
            action = int(rng.choice(4, p=chances(theta, tile)))
            after, reward, over = step(tile, ACTIONS[action], rng)
            # Judge and learn, straight away
            update(theta, values, tile, action, reward, after, over, gamma, actor_rate, critic_rate)
            tile = after
            if over:
                break
        if watch:
            likely = {t: ACTIONS[int(np.argmax(theta[t]))] for t in RACING}
            draw({t: values[t] for t in RACING}, likely, q={t: chances(theta, t) for t in RACING},
                 title=f"race {episode + 1}")
    return theta, values


def clipped_objective(ratio, advantage, epsilon=0.2):
    """PPO's objective for one move: the smaller of the plain and the clipped versions."""
    return np.minimum(ratio * advantage, np.clip(ratio, 1 - epsilon, 1 + epsilon) * advantage)


if __name__ == "__main__":
    rng = np.random.default_rng(3)
    theta, values = train(200, rng, watch=True)
    print("After 200 races, his most likely moves")
    show_policy({tile: ACTIONS[int(np.argmax(theta[tile]))] for tile in RACING})
    print("The critic's values")
    for row in range(ROWS):
        print("".join("     #" if TRACK[row][col] == "#" else f"{values[row, col]:6.1f}" for col in range(COLS)))
    worth = average_return(lambda tile: ACTIONS[int(rng.choice(4, p=chances(theta, tile)))], rng)
    print(f"Average return over 1000 races: {worth:.2f}")
    print()
    print("PPO's clip, with epsilon 0.2")
    for ratio, advantage in [(1.5, 2.0), (0.5, 2.0), (1.5, -2.0), (0.5, -2.0)]:
        print(f"ratio {ratio}, advantage {advantage}: {clipped_objective(ratio, advantage):.1f}")
