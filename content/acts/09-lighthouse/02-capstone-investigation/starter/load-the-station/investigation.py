"""Your investigation of the Stornoway record. Press Run to run this file.

station.py loads and cleans; test_station.py checks the cleaning; this file
asks the question and draws the answer.
"""
import matplotlib.pyplot as plt
import pytest

from station import annual_rain, load_station

if __name__ == "__main__":
    # Your own tests first, run by pytest just as they would be at home
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_station.py"])

    station = load_station("stornowaydata.txt")
    print(f"{len(station)} months, from {station['year'].min()} to {station['year'].max()}")

    # The question, in one sentence:

    # The years to compare, chosen before looking:

    # The analysis

    # The charts: every axis labelled, with units
