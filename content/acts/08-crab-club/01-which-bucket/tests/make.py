import matplotlib.pyplot as plt
import numpy as np


def picks(choose, estimates, counts, times, seed, **options):
    """How often choose picks each version, as fractions, over many calls."""
    rng = np.random.default_rng(seed)
    tally = np.zeros(len(estimates))
    for _ in range(times):
        version = choose(np.array(estimates, dtype=float), np.array(counts), rng, **options)
        if version is None or isinstance(version, (bool, float, str)) or not 0 <= int(version) < len(estimates):
            raise CheckFailed(f"{choose.__name__} should return a version number from 0 to {len(estimates) - 1}, but it returned {version!r}.")
        tally[int(version)] += 1
    return tally / times


def tested(m, *args):
    result = m.run_test(*args)
    if not isinstance(result, (tuple, list)) or len(result) != 3:
        raise CheckFailed("run_test should return three things: return estimates, counts, rewards", actual=repr(result))
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
        raise CheckFailed("Three visitors handed version 1, so counts[1] should be 3.", expected=3, actual=int(counts[1]))
    if abs(estimates[1] - 2 / 3) > 1e-9:
        raise CheckFailed("Came in, walked on, came in: version 1's estimate should be 2/3.", expected="0.667", actual=f"{estimates[1]:.3f}")
    if estimates[0] != 0 or estimates[2] != 0 or counts[0] != 0 or counts[2] != 0:
        raise CheckFailed("Only version 1 was handed out, so only version 1 should change.", actual=f"estimates {estimates}, counts {counts}")


def greedy_when_epsilon_is_zero(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.02, 0.07, 0.04], [5, 5, 5], 50, 1, epsilon=0.0)
    if got[1] != 1.0:
        raise CheckFailed("With epsilon 0 it should never explore: always version 1, the best estimate.", expected="version 1 every time", actual=f"version 1 {got[1]:.0%} of the time")


def standing_start(ctx):
    m = ctx.module()
    estimates = np.array([0.5, 0.0, 0.0])
    counts = np.array([2, 0, 0])
    m.update(estimates, counts, 0, 0)
    m.update(estimates, counts, 2, 1)
    if abs(estimates[0] - 1 / 3) > 1e-9:
        raise CheckFailed("Version 0 was at 0.5 after two visitors; a third who walks on brings it to 1/3.", expected="0.333", actual=f"{estimates[0]:.3f}")
    if abs(estimates[2] - 1.0) > 1e-9 or counts[2] != 1:
        raise CheckFailed("Version 2's first visitor came in, so its estimate is 1.0 and its count 1.", expected="1.0 and 1", actual=f"{estimates[2]} and {counts[2]}")


def even_split_in_turn(ctx):
    m = ctx.module()
    rng = np.random.default_rng(2)
    for counts, want in (([0, 0, 0, 0], 0), ([1, 0, 0, 0], 1), ([5, 4, 4, 4], 1), ([6, 6, 5, 5], 2), ([3, 3, 3, 3], 0), ([2, 2, 1], 2)):
        got = m.choose_even_split(np.zeros(len(counts)), np.array(counts), rng)
        if got != want:
            raise CheckFailed(f"Handed out {counts} so far, in turn, the next visitor gets version {want}.", expected=want, actual=got)


def even_split_ignores_results(ctx):
    m = ctx.module()
    got = picks(m.choose_even_split, [0.9, 0.0, 0.0, 0.0], [2, 1, 1, 1], 20, 3)
    if got[1] != 1.0:
        raise CheckFailed("The plain A/B test doesn't look at the results: version 1 is next in turn, however well version 0 is doing.", expected="version 1 every time", actual=", ".join(f"{s:.0%}" for s in got))


def explores_everywhere(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.0, 0.0, 0.9, 0.0, 0.0], [3, 3, 3, 3, 3], 4000, 2, epsilon=1.0)
    for version, share in enumerate(got):
        if abs(share - 0.2) > 0.04:
            raise CheckFailed(f"With epsilon 1 every pick explores, so each of five versions should come up about one time in five. Version {version} came up {share:.1%} of the time.", expected="about 20% each", actual=", ".join(f"{s:.1%}" for s in got))


def explores_sometimes(ctx):
    m = ctx.module()
    got = picks(m.choose_epsilon_greedy, [0.01, 0.08, 0.03, 0.05], [90, 90, 90, 90], 4000, 3, epsilon=0.2)
    if abs(got[1] - 0.85) > 0.035:
        raise CheckFailed("With epsilon 0.2 it exploits 80% of the time, and exploring lands on the best version a quarter of the time too: about 85% in all.", expected="about 85% version 1", actual=f"{got[1]:.1%}")


def ucb_tries_everything(ctx):
    m = ctx.module()
    rng = np.random.default_rng(4)
    got = m.choose_ucb(np.array([0.5, 0.0, 0.9]), np.array([3, 0, 2]), rng)
    if got != 1:
        raise CheckFailed("Version 1 has never been handed out, so UCB should try it before anything else.", expected=1, actual=got)
    got = m.choose_ucb(np.array([0.6, 0.2, 0.0, 0.8]), np.array([1, 1, 0, 4]), rng)
    if got != 2:
        raise CheckFailed("Version 2 has never been handed out.", expected=2, actual=got)


def ucb_bonus(ctx):
    m = ctx.module()
    rng = np.random.default_rng(5)
    got = m.choose_ucb(np.array([0.17, 0.12]), np.array([400, 8]), rng, c=1.0)
    if got != 1:
        raise CheckFailed("Estimates 0.17 and 0.12 from 400 visitors and 8: version 1's bonus is far bigger, so UCB picks it.", expected=1, actual=got)
    got = m.choose_ucb(np.array([0.17, 0.12]), np.array([400, 400]), rng, c=1.0)
    if got != 0:
        raise CheckFailed("Same estimates, 400 visitors each: the bonuses are equal, so the better estimate wins.", expected=0, actual=got)


def ucb_uses_c(ctx):
    m = ctx.module()
    rng = np.random.default_rng(6)
    small = m.choose_ucb(np.array([0.7, 0.5]), np.array([50, 10]), rng, c=0.1)
    large = m.choose_ucb(np.array([0.7, 0.5]), np.array([50, 10]), rng, c=2.0)
    if (small, large) != (0, 1):
        raise CheckFailed("Estimates 0.7 and 0.5 from 50 visitors and 10: with c=0.1 the bonus hardly counts and version 0 wins; with c=2.0 version 1 does.", expected="0 then 1", actual=f"{small} then {large}")


def ucb_uses_total(ctx):
    m = ctx.module()
    got = m.choose_ucb(np.array([0.5, 0.3]), np.array([100, 1]), np.random.default_rng(7), c=1.0)
    if got != 1:
        raise CheckFailed("Version 1 has had one visitor in 101. Its bonus is sqrt(ln(101) / 1), about 2.1, so UCB picks it.", expected=1, actual=got)


def thompson_confident(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.9, 0.1], [100, 100], 500, 8)
    if got[0] < 0.99:
        raise CheckFailed("90 visitors in 100 came in against 10 in 100: Thompson sampling should almost always pick version 0.", expected="version 0 at least 99% of the time", actual=f"{got[0]:.1%}")


def thompson_untried(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.0, 0.0, 0.0], [0, 0, 0], 3000, 9)
    for version, share in enumerate(got):
        if abs(share - 1 / 3) > 0.04:
            raise CheckFailed("With nothing handed out yet, every rate is equally plausible, so each of three versions should be picked about a third of the time.", expected="about 33% each", actual=", ".join(f"{s:.1%}" for s in got))


def thompson_doubt(ctx):
    m = ctx.module()
    got = picks(m.choose_thompson, [0.6, 0.5], [5, 4], 2000, 10)
    if abs(got[1] - 0.39) > 0.06:
        raise CheckFailed("3 visitors in 5 against 2 in 4 is hardly any evidence. Thompson sampling should still pick version 1 about 39% of the time.", expected="about 39% version 1", actual=f"{got[1]:.1%}")


def test_with_a_certain_version(ctx):
    m = ctx.module()
    estimates, counts, rewards = tested(m, lambda estimates, counts, rng: 2, [0.0, 0.0, 1.0], 50, np.random.default_rng(11))
    if len(rewards) != 50:
        raise CheckFailed("run_test should give back one reward for each visitor.", expected=50, actual=len(rewards))
    if np.sum(rewards) != 50:
        raise CheckFailed("Version 2 has a rate of 1.0, so every visitor handed it comes in.", expected="50 came in", actual=f"{np.sum(rewards)} came in")
    if list(counts) != [0, 0, 50]:
        raise CheckFailed("Every visitor was handed version 2.", expected="[0, 0, 50]", actual=str(list(counts)))
    if abs(estimates[2] - 1.0) > 1e-9:
        raise CheckFailed("Version 2's estimate, after 50 visitors who all came in, is 1.0.", expected=1.0, actual=float(estimates[2]))


def test_keeps_score(ctx):
    m = ctx.module()
    seen = []

    def watcher(estimates, counts, rng):
        seen.append(([float(e) for e in estimates], [int(c) for c in counts]))
        return len(seen) % 2

    tested(m, watcher, [0.0, 1.0], 4, np.random.default_rng(12))
    expected = [([0.0, 0.0], [0, 0]), ([0.0, 1.0], [0, 1]), ([0.0, 1.0], [1, 1]), ([0.0, 1.0], [1, 2])]
    if seen != expected:
        raise CheckFailed("Each choice should see the estimates and counts updated after every visitor so far.", expected=str(expected), actual=str(seen))


def test_learns(ctx):
    m = ctx.module()
    estimates, counts, rewards = tested(m, m.choose_epsilon_greedy, [0.2, 0.8, 0.3], 2000, np.random.default_rng(13))
    if counts[1] < 1500 or np.mean(rewards) < 0.7:
        raise CheckFailed("With epsilon-greedy on rates 0.2, 0.8 and 0.3, most of 2000 visitors should be handed version 1.", expected="over 1500 visitors for version 1", actual=f"counts {list(counts)}, {np.mean(rewards):.2f} came in")


def even_split_test(ctx):
    m = ctx.module()
    estimates, counts, rewards = tested(m, m.choose_even_split, [0.1, 0.2, 0.3], 3000, np.random.default_rng(14))
    if list(counts) != [1000, 1000, 1000]:
        raise CheckFailed("3000 visitors in turn between three versions is 1000 each.", expected="[1000, 1000, 1000]", actual=str(list(counts)))
    for version, (estimate, rate) in enumerate(zip(estimates, [0.1, 0.2, 0.3])):
        if abs(estimate - rate) > 0.05:
            raise CheckFailed(f"With 1000 visitors each, version {version}'s estimate should be close to its rate, {rate}.", actual=f"{estimate:.3f}")


def regret_of_a_fair_test(ctx):
    m = ctx.module()
    got = m.regret(np.array([250, 250, 250, 250]), [0.10, 0.14, 0.08, 0.17])
    if got is None or abs(got - 47.5) > 1e-6:
        raise CheckFailed("A quarter of 1000 visitors each: 250 times each version's gap to the best, 0.17, added up.", expected=47.5, actual=got)


def regret_of_the_best(ctx):
    m = ctx.module()
    got = m.regret(np.array([0, 0, 40]), [0.3, 0.2, 0.4])
    if got is None or abs(got) > 1e-9:
        raise CheckFailed("Every visitor was handed the best version, so nothing was lost.", expected=0.0, actual=got)
    got = m.regret(np.array([12, 30]), [0.5, 0.25])
    if got is None or abs(got - 7.5) > 1e-9:
        raise CheckFailed("The best version can be any of them, not only the last: here version 0, so 30 visitors each lost a quarter.", expected=7.5, actual=got)


def chance_best_adds_up(ctx):
    m = ctx.module()
    got = np.asarray(m.chance_best(np.array([0.3, 0.2, 0.25]), np.array([50, 50, 50]), np.random.default_rng(15)), dtype=float)
    if got.shape != (3,):
        raise CheckFailed("chance_best should give one chance for each version.", expected="3 numbers", actual=str(got))
    if abs(got.sum() - 1.0) > 1e-9 or (got < 0).any():
        raise CheckFailed("Exactly one version is the best in each draw, so the chances add up to 1.", expected=1.0, actual=float(got.sum()))


def chance_best_clear(ctx):
    m = ctx.module()
    got = m.chance_best(np.array([0.9, 0.1]), np.array([100, 100]), np.random.default_rng(16))
    if got[0] < 0.999:
        raise CheckFailed("90 visitors in 100 came in against 10 in 100: version 0 is all but certainly the best.", expected="over 99.9%", actual=f"{got[0]:.1%}")


def chance_best_untried(ctx):
    m = ctx.module()
    got = m.chance_best(np.zeros(4), np.zeros(4, dtype=int), np.random.default_rng(17))
    for version, share in enumerate(got):
        if abs(share - 0.25) > 0.03:
            raise CheckFailed("With nothing handed out yet, each of four versions is equally likely to be the best.", expected="about 25% each", actual=", ".join(f"{s:.1%}" for s in got))


def chance_best_thin(ctx):
    m = ctx.module()
    got = m.chance_best(np.array([0.6, 0.5]), np.array([5, 4]), np.random.default_rng(18))
    if abs(got[1] - 0.39) > 0.03:
        raise CheckFailed("3 visitors in 5 against 2 in 4: version 1 is still the best about 39% of the time.", expected="about 39% for version 1", actual=f"{got[1]:.1%}")


def chance_best_draws(ctx):
    m = ctx.module()
    got = np.asarray(m.chance_best(np.array([0.5, 0.5]), np.array([10, 10]), np.random.default_rng(19), draws=8), dtype=float)
    if not np.allclose(got * 8, np.round(got * 8)):
        raise CheckFailed("With draws=8 every chance is a number of draws out of 8, such as 0.375.", actual=str(got))


def the_whole_program(ctx):
    plt.close("all")
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    printed = result.output.lower()
    for name in ["even split", "greedy", "epsilon-greedy", "ucb", "thompson"]:
        if name not in printed:
            raise CheckFailed(f"Print a line for each strategy. Nothing mentions {name}.", actual=result.output)
    if "recommend" not in printed:
        raise CheckFailed("Finish with a recommendation: the handbill to print, and how likely it is to be the best.", actual=result.output)
    if not plt.get_fignums():
        raise CheckFailed("Draw the chart: a line for each strategy, the share who came in so far against the visitors so far.")
    plt.close("all")


TESTS = [
    custom("update keeps a running average", running_average, visible=True),
    custom("Epsilon 0 never explores", greedy_when_epsilon_is_zero, visible=True),
    custom("update from a standing start", standing_start),
    custom("The even split goes in turn", even_split_in_turn,
           hint="Everyone handed out so far is sum(counts). The next version in turn is that number, wrapped round with %."),
    custom("The even split ignores the results", even_split_ignores_results),
    custom("Exploring reaches every version", explores_everywhere,
           hint="rng.integers(5) gives 0 to 4. The end is left out, as with range, so rng.integers(0, 4) never gives 4."),
    custom("Exploring one time in five", explores_sometimes,
           hint="When it explores, any version can come up, the best one included."),
    custom("UCB tries every version first", ucb_tries_everything,
           hint="A version with a count of 0 has no estimate to trust. Return it straight away."),
    custom("UCB's bonus for versions tried less", ucb_bonus),
    custom("UCB uses c", ucb_uses_c, hint="The bonus is c times the square root, so a small c means a small bonus."),
    custom("UCB counts every visitor", ucb_uses_total,
           hint="Inside the logarithm goes the total number of visitors for every version, not this version's count."),
    custom("Thompson sampling when the evidence is clear", thompson_confident),
    custom("Thompson sampling with nothing tried", thompson_untried,
           hint="rng.beta needs both numbers above zero. Beta(wins + 1, losses + 1) starts every version at Beta(1, 1)."),
    custom("Thompson sampling when the evidence is thin", thompson_doubt),
    custom("run_test with a certain version", test_with_a_certain_version,
           hint="A visitor comes in when rng.random() is below the version's rate."),
    custom("run_test keeps the score up to date", test_keeps_score,
           hint="Call update after every visitor, before choosing for the next one."),
    custom("run_test learns", test_learns),
    custom("run_test with the even split", even_split_test),
    custom("The regret of a fair test", regret_of_a_fair_test),
    custom("Regret when the best was handed out", regret_of_the_best,
           hint="The best rate is max(rates), wherever it is in the list. Each version's visitors lose its own gap to that."),
    custom("chance_best adds up to 1", chance_best_adds_up),
    custom("chance_best when the evidence is clear", chance_best_clear),
    custom("chance_best with nothing tried", chance_best_untried,
           hint="Beta(wins + 1, losses + 1) again, so an untried version can still win a draw."),
    custom("chance_best when the evidence is thin", chance_best_thin),
    custom("chance_best uses draws", chance_best_draws,
           hint="Draw `draws` rows of samples, one column per version, and divide the counts by draws."),
    custom("The whole program: a line each, a recommendation and a chart", the_whole_program, timeout=30),
]
