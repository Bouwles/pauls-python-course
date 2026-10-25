import pandas as pd


def z_scores(values):
    """How many standard deviations each reading is from the mean."""
    return (values - values.mean()) / values.std()
