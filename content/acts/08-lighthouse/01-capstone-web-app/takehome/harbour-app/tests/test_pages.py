"""The agreed parts of the pages people use. The rest of the pages are yours
to design, and to test in test_mine.py.
"""


def test_front_page_is_a_web_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.mimetype == "text/html"


def test_front_page_lists_every_berth(client):
    page = client.get("/").get_data(as_text=True)
    for name in ("Pontoon A", "Pontoon B", "Pontoon C", "North Quay", "Harbour Wall"):
        assert name in page


def test_front_page_shows_a_nights_bookings(client):
    client.post("/api/bookings", json={"boat": "Kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2})
    assert "Kittiwake" in client.get("/?date=2027-04-11").get_data(as_text=True)
    assert "Kittiwake" not in client.get("/?date=2027-04-12").get_data(as_text=True)


def test_boat_names_are_shown_as_text(client):
    client.post("/api/bookings", json={"boat": "sea <script>", "length": 6.0, "berth": 1, "date": "2027-04-10"})
    page = client.get("/?date=2027-04-10").get_data(as_text=True)
    assert "<Script>" not in page
    assert "&lt;Script&gt;" in page
