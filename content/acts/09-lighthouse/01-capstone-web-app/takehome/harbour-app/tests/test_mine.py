"""Your own tests. The agreed ones are the marina's; these are for whatever you
know might break. One to start you off, using the same client fixture.
"""


def test_every_berth_has_a_length(client):
    berths = client.get("/api/berths").get_json()
    assert all(berth["max_length"] > 0 for berth in berths)
