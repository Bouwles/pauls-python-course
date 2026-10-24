"""Agnes's agreed routes, as tests. Leave these as they are: they're the
contract. Your own tests go in test_mine.py.
"""
from app import create_app

KITTIWAKE = {"boat": "Kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2}


def book(client, **changes):
    """Book the Kittiwake, with any changes: book(client, berth=3)."""
    return client.post("/api/bookings", json={**KITTIWAKE, **changes})


def assert_error(response, status):
    """The status Agnes asked for, and a JSON object with a message in "error"."""
    assert response.status_code == status
    body = response.get_json(silent=True)
    assert isinstance(body, dict), "An error should come back as JSON too."
    assert isinstance(body.get("error"), str) and body["error"].strip(), 'The JSON should say what went wrong, under "error".'


def test_berths(client):
    response = client.get("/api/berths")
    assert response.status_code == 200
    berths = response.get_json()
    assert len(berths) == 5
    assert berths[0] == {"id": 1, "name": "Pontoon A", "max_length": 8.0}
    assert all(set(berth) == {"id", "name", "max_length"} for berth in berths)


def test_no_bookings_yet(client):
    response = client.get("/api/bookings")
    assert response.status_code == 200
    assert response.get_json() == []


def test_book_a_berth(client):
    response = book(client)
    assert response.status_code == 201
    assert response.get_json() == {**KITTIWAKE, "id": 1}


def test_a_booking_can_be_fetched(client):
    book(client)
    response = client.get("/api/bookings/1")
    assert response.status_code == 200
    assert response.get_json() == {**KITTIWAKE, "id": 1}


def test_bookings_are_listed(client):
    book(client)
    book(client, boat="Puffin", berth=3)
    response = client.get("/api/bookings")
    assert response.status_code == 200
    assert [(b["id"], b["boat"]) for b in response.get_json()] == [(1, "Kittiwake"), (2, "Puffin")]


def test_boat_names_are_tidied(client):
    response = book(client, boat="  mary rose ")
    assert response.get_json()["boat"] == "Mary Rose"


def test_one_night_unless_told_otherwise(client):
    response = client.post("/api/bookings", json={"boat": "Puffin", "length": 7.0, "berth": 1, "date": "2027-05-01"})
    assert response.status_code == 201
    assert response.get_json()["nights"] == 1


def test_bookings_for_one_night(client):
    book(client)
    book(client, boat="Puffin", date="2027-04-12", nights=1)

    def boats_on(night):
        response = client.get(f"/api/bookings?date={night}")
        assert response.status_code == 200
        return [b["boat"] for b in response.get_json()]

    assert boats_on("2027-04-09") == []
    assert boats_on("2027-04-11") == ["Kittiwake"]
    assert boats_on("2027-04-12") == ["Puffin"]


def test_a_boat_needs_a_name(client):
    assert_error(client.post("/api/bookings", json={"length": 9.5, "berth": 2, "date": "2027-04-10"}), 400)
    assert_error(book(client, boat="   "), 400)


def test_the_booking_must_be_json(client):
    assert_error(client.post("/api/bookings", data={"boat": "Kittiwake", "length": "9.5", "berth": "2", "date": "2027-04-10"}), 400)


def test_dates_must_be_real(client):
    assert_error(book(client, date="2027-13-40"), 400)
    assert_error(book(client, date="10/04/2027"), 400)


def test_lengths_must_be_positive_numbers(client):
    for length in (0, -3, "nine", None):
        assert_error(book(client, length=length), 400)


def test_nights_must_be_one_to_fourteen(client):
    for nights in (0, 15, 2.5, "two"):
        assert_error(book(client, nights=nights), 400)
    assert book(client, nights=14).status_code == 201


def test_unknown_berth(client):
    assert_error(book(client, berth=9), 400)


def test_boat_too_long_for_the_berth(client):
    assert_error(book(client, length=12.0), 400)
    assert book(client, length=10.0).status_code == 201


def test_no_two_boats_in_one_berth_on_one_night(client):
    book(client)
    assert_error(book(client, boat="Puffin", date="2027-04-11"), 409)
    assert book(client, boat="Puffin", date="2027-04-11", berth=3).status_code == 201


def test_back_to_back_bookings_are_fine(client):
    book(client)
    assert book(client, boat="Puffin", date="2027-04-12").status_code == 201
    assert book(client, boat="Shearwater", date="2027-04-08", nights=2).status_code == 201


def test_unknown_booking(client):
    assert_error(client.get("/api/bookings/99"), 404)


def test_cancel_a_booking(client):
    book(client)
    response = client.delete("/api/bookings/1")
    assert response.status_code == 204
    assert response.data == b""
    assert_error(client.get("/api/bookings/1"), 404)
    assert_error(client.delete("/api/bookings/1"), 404)
    assert book(client, boat="Puffin").status_code == 201


def test_booking_numbers_are_never_reused(client):
    book(client)
    client.delete("/api/bookings/1")
    assert book(client).get_json()["id"] == 2


def test_bookings_survive_a_restart(tmp_path):
    data_file = tmp_path / "harbour-data"
    before = create_app(data_file).test_client()
    book(before)
    book(before, boat="Puffin", berth=3)
    before.delete("/api/bookings/2")

    after = create_app(data_file).test_client()
    assert [b["boat"] for b in after.get("/api/bookings").get_json()] == ["Kittiwake"]
    assert book(after, boat="Shearwater", berth=4).get_json()["id"] == 3
