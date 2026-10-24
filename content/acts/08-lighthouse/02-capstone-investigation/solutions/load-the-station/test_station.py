"""Your own tests for station.py. investigation.py runs them with pytest.

Two to start you off. Add yours: what has to be true of the cleaned table
before anyone should believe an answer drawn from it?
"""
import pytest

from station import annual_rain, load_station


@pytest.fixture(scope="module")
def station():
    """The cleaned table, loaded once and handed to every test that asks for it."""
    return load_station("stornowaydata.txt")


def test_one_row_per_month(station):
    assert not station.duplicated(["year", "month"]).any()


def test_months_run_from_1_to_12(station):
    assert station["month"].between(1, 12).all()


def test_rain_is_never_negative(station):
    assert (station["rain"].dropna() >= 0).all()


def test_the_warmest_day_beats_the_coldest_night(station):
    both = station.dropna(subset=["tmax", "tmin"])
    assert (both["tmax"] > both["tmin"]).all()


def test_no_months_missing_between_the_first_and_the_last(station):
    months = station["year"] * 12 + station["month"]
    assert (months.diff().dropna() == 1).all()


def test_sunshine_starts_in_1929(station):
    assert station.loc[station["sun"].notna(), "year"].min() == 1929


def test_part_years_have_no_rain_total(station):
    totals = annual_rain(station)
    assert totals[[1873, 2026]].isna().all()
