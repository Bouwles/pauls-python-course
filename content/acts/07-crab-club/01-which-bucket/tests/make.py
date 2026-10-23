import matplotlib.pyplot as plt
import numpy as np


def picks(choose, estimates, counts, times, seed, **options):
    """How often choose picks each bucket, as fractions, over many calls."""
    rng = np.random.default_rng(seed)
    tally = np.zeros(len(estimates))
    for _ in range(times):
        bucket = choose(np.array(estimates, dtype=float), np.array(counts), rng, **options)
        if bucket is None or isinstance(bucket, (bool, float, str)) or not 0 <= int(bucket) < len(estimates):
            raise CheckFailed(f"{choose.__name__} should return a bucket number from 0 to {len(estimates) - 1}, but it returned {bucket!r}.")
        tally[int(bucket)] += 1
    return tally / times


def practised(m, *args):
    result = m.practise(*args)
    if not isinstance(result, (tuple, list)) or len(result) != 2:
        raise CheckFailed("practise should return two things, rewards and counts: return rewards, counts", actual=repr(result))
    return result


def running_average(ctx):
    m = ctx.module()
    estimates = np.zeros(3)
    counts = np.zeros(3, dtype=int)
    for reward in [1, 0, 1]:
        m.update(estimates, counts, 1, reward)
    if counts[1] == 0 and estimates[1] == 0:
        raise CheckFailed("update should change the arrays it is given, in place, not make new ones.")
    if counts[1] != 3:
        raise CheckFailed("Three runs on bucket 1, so counts[1] should be 3.", expected=3, actual=int(counts[1]))
    if abs(estimates[1] - 2 / 3) > 1e-9:
        raise CheckFailed("Good, bad, good: bucket 1's estimate should be 2/3.", expected="0.667", actual=f"{estimates[1]:.3f}")
    if estimates[0] != 0 or estimates[2] != 0 or counts[0] != 0 or counts[2] != 0:
        raise CheckFailed("Only bucket 1 was tried, so only bucket 1 should change.", actual=f"estimates {estimates}, counts {counts}")


def greedy_when_epsilon_is_zero(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.2, 0.7, 0.4], [5, 5, 5], 50, 1, epsilon=0.0)
    if got[1] != 1.0:
        raise CheckFailed("With epsilon 0 it should never explore: always bucket 1, the best estimate.", expected="bucket 1 every time", actual=f"bucket 1 {got[1]:.0%} of the time")


def standing_start(ctx):
    m = ctx.module()
    estimates = np.array([0.5, 0.0, 0.0])
    counts = np.array([2, 0, 0])
    m.update(estimates, counts, 0, 0)
    m.update(estimates, counts, 2, 1)
    if abs(estimates[0] - 1 / 3) > 1e-9:
        raise CheckFailed("Bucket 0 was at 0.5 after two runs; a bad third run brings it to 1/3.", expected="0.333", actual=f"{estimates[0]:.3f}")
    if abs(estimates[2] - 1.0) > 1e-9 or counts[2] != 1:
        raise CheckFailed("Bucket 2's first run was good, so its estimate is 1.0 and its count 1.", expected="1.0 and 1", actual=f"{estimates[2]} and {counts[2]}")


def explores_everywhere(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.0, 0.0, 0.9, 0.0, 0.0], [3, 3, 3, 3, 3], 4000, 2, epsilon=1.0)
    for bucket, share in enumerate(got):
        if abs(share - 0.2) > 0.04:
            raise CheckFailed(f"With epsilon 1 every pick explores, so each of the five buckets should come up about one time in five. Bucket {bucket} came up {share:.1%} of the time.", expected="about 20% each", actual=", ".join(f"{s:.1%}" for s in got))


def explores_sometimes(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.1, 0.8, 0.3, 0.5], [9, 9, 9, 9], 4000, 3, epsilon=0.2)
    if abs(got[1] - 0.85) > 0.035:
        raise CheckFailed("With epsilon 0.2 it exploits 80% of the time, and exploring lands on the best bucket a quarter of the time too: about 85% in all.", expected="about 85% bucket 1", actual=f"{got[1]:.1%}")


def ucb_tries_everything(ctx):
    m = ctx.module()
    rng = np.random.default_rng(4)
    got = m.choose_ucb(np.array([0.5, 0.0, 0.9]), np.array([3, 0, 2]), rng)
    if got != 1:
        raise CheckFailed("Bucket 1 has never been tried, so UCB should try it before anything else.", expected=1, actual=got)
    got = m.choose_ucb(np.array([0.6, 0.2, 0.0, 0.8]), np.array([1, 1, 0, 4]), rng)
    if got != 2:
        raise CheckFailed("Bucket 2 has never been tried.", expected=2, actual=got)


def ucb_bonus(ctx):
    m = ctx.module()
    rng = np.random.default_rng(5)
    got = m.choose_ucb(np.array([0.60, 0.45]), np.array([40, 3]), rng, c=1.0)
    if got != 1:
        raise CheckFailed("Estimates 0.60 and 0.45 from 40 runs and 3: bucket 1's bonus is far bigger, so UCB picks it.", expected=1, actual=got)
    got = m.choose_ucb(np.array([0.60, 0.45]), np.array([40, 40]), rng, c=1.0)
    if got != 0:
        raise CheckFailed("Same estimates, 40 runs each: the bonuses are equal, so the better estimate wins.", expected=0, actual=got)


def ucb_uses_c(ctx):
    m = ctx.module()
    rng = np.random.default_rng(6)
    small = m.choose_ucb(np.array([0.7, 0.5]), np.array([50, 10]), rng, c=0.1)
    large = m.choose_ucb(np.array([0.7, 0.5]), np.array([50, 10]), rng, c=2.0)
    if (small, large) != (0, 1):
        raise CheckFailed("Estimates 0.7 and 0.5 from 50 runs and 10: with c=0.1 the bonus hardly counts and bucket 0 wins; with c=2.0 bucket 1 does.", expected="0 then 1", actual=f"{small} then {large}")


def ucb_uses_total(ctx):
    m = ctx.module()
    got = m.choose_ucb(np.array([0.5, 0.3]), np.array([100, 1]), np.random.default_rng(7), c=1.0)
    if got != 1:
        raise CheckFailed("Bucket 1 has had one run in 101. Its bonus is sqrt(ln(101) / 1), about 2.1, so UCB picks it.", expected=1, actual=got)


def thompson_confident(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.9, 0.1], [100, 100], 500, 8)
    if got[0] < 0.99:
        raise CheckFailed("90 good runs in 100 against 10 in 100: Thompson sampling should almost always pick bucket 0.", expected="bucket 0 at least 99% of the time", actual=f"{got[0]:.1%}")


def thompson_untried(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.0, 0.0, 0.0], [0, 0, 0], 3000, 9)
    for bucket, share in enumerate(got):
        if abs(share - 1 / 3) > 0.04:
            raise CheckFailed("With nothing tried, every rate is equally plausible, so each of three buckets should be picked about a third of the time.", expected="about 33% each", actual=", ".join(f"{s:.1%}" for s in got))


def thompson_doubt(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.6, 0.5], [5, 4], 2000, 10)
    if abs(got[1] - 0.39) > 0.06:
        raise CheckFailed("3 good runs in 5 against 2 in 4 is hardly any evidence. Thompson sampling should still pick bucket 1 about 39% of the time.", expected="about 39% bucket 1", actual=f"{got[1]:.1%}")


def practise_certain(ctx):
    m = ctx.module()
    rewards, counts = practised(m, lambda estimates, counts, rng: 2, [0.0, 0.0, 1.0], 50, np.random.default_rng(11))
    if len(rewards) != 50:
        raise CheckFailed("practise should give back one reward for each run.", expected=50, actual=len(rewards))
    if np.sum(rewards) != 50:
        raise CheckFailed("Bucket 2 has a rate of 1.0, so every run on it is good.", expected="50 good runs", actual=f"{np.sum(rewards)} good runs")
    if list(counts) != [0, 0, 50]:
        raise CheckFailed("Every run went on bucket 2.", expected="[0, 0, 50]", actual=str(list(counts)))


def practise_keeps_score(ctx):
    m = ctx.module()
    seen = []

    def watcher(estimates, counts, rng):
        seen.append(([float(e) for e in estimates], [int(c) for c in counts]))
        return len(seen) % 2

    practised(m, watcher, [0.0, 1.0], 4, np.random.default_rng(12))
    expected = [([0.0, 0.0], [0, 0]), ([0.0, 1.0], [0, 1]), ([0.0, 1.0], [1, 1]), ([0.0, 1.0], [1, 2])]
    if seen != expected:
        raise CheckFailed("Each choice should see the estimates and counts updated after every run so far.", expected=str(expected), actual=str(seen))


def practise_learns(ctx):
    m = ctx.module()
    rewards, counts = practised(m, m.choose_epsilon_greedy, [0.2, 0.8, 0.3], 2000, np.random.default_rng(13))
    if counts[1] < 1500 or np.mean(rewards) < 0.7:
        raise CheckFailed("With epsilon-greedy on rates 0.2, 0.8 and 0.3, most of 2000 runs should go on bucket 1.", expected="over 1500 runs on bucket 1", actual=f"counts {list(counts)}, {np.mean(rewards):.2f} good")


def the_whole_program(ctx):
    plt.close("all")
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    printed = result.output.lower()
    for name in ["greedy", "ucb", "thompson"]:
        if name not in printed:
            raise CheckFailed(f"Print a line for each strategy. Nothing mentions {name}.", actual=result.output)
    if not plt.get_fignums():
        raise CheckFailed("Draw the chart: a line for each strategy, good runs so far against practice runs.")
    plt.close("all")


TESTS = [
    custom("update keeps a running average", running_average, visible=True),
    custom("Epsilon 0 never explores", greedy_when_epsilon_is_zero, visible=True),
    custom("update from a standing start", standing_start),
    custom("Exploring reaches every bucket", explores_everywhere,
           hint="rng.integers(5) gives 0 to 4. The end is left out, as with range, so rng.integers(0, 4) never gives 4."),
    custom("Exploring one time in five", explores_sometimes,
           hint="When it explores, any bucket can come up, the best one included."),
    custom("UCB tries every bucket first", ucb_tries_everything,
           hint="A bucket with a count of 0 has no estimate to trust. Return it straight away."),
    custom("UCB's bonus for buckets tried less", ucb_bonus),
    custom("UCB uses c", ucb_uses_c, hint="The bonus is c times the square root, so a small c means a small bonus."),
    custom("UCB counts every run", ucb_uses_total,
           hint="Inside the logarithm goes the total number of runs on every bucket, not this bucket's count."),
    custom("Thompson sampling when the evidence is clear", thompson_confident),
    custom("Thompson sampling with nothing tried", thompson_untried,
           hint="rng.beta needs both numbers above zero. Beta(wins + 1, losses + 1) starts every bucket at Beta(1, 1)."),
    custom("Thompson sampling when the evidence is thin", thompson_doubt),
    custom("practise with a certain bucket", practise_certain,
           hint="A run is good when rng.random() is below the bucket's rate."),
    custom("practise keeps the score up to date", practise_keeps_score,
           hint="Call update after every run, before choosing the next bucket."),
    custom("practise learns", practise_learns),
    custom("The whole program: four lines and a chart", the_whole_program),
]
