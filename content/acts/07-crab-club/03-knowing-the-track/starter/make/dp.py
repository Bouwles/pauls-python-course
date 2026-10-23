# Knowing the track: the worth of every tile, worked out without a single race.

from track import ACTIONS, TILES, TRADITIONAL, draw, is_over, outcomes, show_policy, show_values


def q_value(values, tile, action, gamma=0.9):
    """What action is worth on tile: for each outcome, its reward plus gamma times
    the worth of where it leads (nothing, if the race is over), weighted by its chance."""


def evaluate(policy, gamma=0.9, theta=1e-6):
    """The worth of every tile, following policy. The finish and the pool stay at 0."""
    # Start every value at nothing
    # Sweep: each tile's worth is what its policy's action is worth
    # Keep track of the biggest change
    # Stop when nothing changes by more than theta


def greedy(values, gamma=0.9):
    """The best action on every tile where the race isn't over, looking one step ahead."""


def value_iteration(gamma=0.9, theta=1e-6):
    """The worth of every tile under the best possible policy."""
    # As evaluate, but each tile takes its best action's worth.
    # Put draw(values, greedy(values, gamma), title=...) at the end of each sweep
    # and press Run to watch the worth spread back from the finish.


def policy_iteration(policy, gamma=0.9):
    """Evaluate, improve, repeat, until the policy stops changing. Returns (policy, values)."""


if __name__ == "__main__":
    # The traditional line's values; the best values and the best line;
    # and whether policy iteration from the traditional line agrees.
    pass
