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
