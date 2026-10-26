def census_year(census, year):
    return census[census["year"] == year]


def share_under(census, year, age):
    """The share of one year's people younger than age, between 0 and 1."""
    return (census_year(census, year)["age"] < age).mean()
