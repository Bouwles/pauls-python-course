"""The high-score table on the side of the cabinet."""
import pytest

from scores import add_score, top_scores


def test_no_scores_yet(tmp_path):
    assert top_scores(tmp_path / "scores.json") == []


def test_best_first(tmp_path):
    table = tmp_path / "scores.json"
    for initials, score in [("GWN", 12), ("TOM", 31), ("PIP", 4)]:
        add_score(table, initials, score)
    assert top_scores(table) == [("TOM", 31), ("GWN", 12), ("PIP", 4)]


def test_only_the_top_five(tmp_path):
    table = tmp_path / "scores.json"
    for score in [5, 9, 1, 7, 3, 8, 2]:
        add_score(table, "BEA", score)
    assert [score for _, score in top_scores(table)] == [9, 8, 7, 5, 3]
    assert len(top_scores(table, count=3)) == 3


def test_a_tie_keeps_the_first_above(tmp_path):
    table = tmp_path / "scores.json"
    add_score(table, "MIR", 20)
    add_score(table, "AGN", 20)
    assert top_scores(table) == [("MIR", 20), ("AGN", 20)]


def test_initials_are_tidied(tmp_path):
    table = tmp_path / "scores.json"
    add_score(table, " gw ", 15)
    assert top_scores(table) == [("GW", 15)]


def test_initials_are_one_to_three_letters(tmp_path):
    table = tmp_path / "scores.json"
    for bad in ["", "   ", "GWEN", "G1"]:
        with pytest.raises(ValueError):
            add_score(table, bad, 10)
    assert top_scores(table) == []


def test_scores_survive_the_night(tmp_path):
    table = tmp_path / "scores.json"
    add_score(table, "OKO", 18)
    assert top_scores(str(table)) == [("OKO", 18)]
