"""Your own tests. The agreed ones are the marina's; these are for whatever you
know might break. One to start you off, using the same client fixture.
"""
from app import create_app

KITTIWAKE = {"boat": "Kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2}


def test_every_berth_has_a_length(client):
    berths = client.get("/api/berths").get_json()
    assert all(berth["max_length"] > 0 for berth in berths)


def test_a_missing_data_file_means_no_bookings(tmp_path):
    client = create_app(tmp_path / "not-there-yet").test_client()
    assert client.get("/api/bookings").get_json() == []


def test_a_nonsense_date_in_the_list_is_refused(client):
    assert client.get("/api/bookings?date=soon").status_code == 400


def test_a_clash_says_who_is_in_the_berth(client):
    client.post("/api/bookings", json=KITTIWAKE)
    response = client.post("/api/bookings", json={**KITTIWAKE, "boat": "Puffin"})
    assert "Kittiwake" in response.get_json()["error"]


def test_spaces_inside_names_are_tidied(client):
    response = client.post("/api/bookings", json={**KITTIWAKE, "boat": "mary   rose"})
    assert response.get_json()["boat"] == "Mary Rose"


def test_the_form_books_a_berth(client):
    response = client.post("/book", data={"boat": "puffin", "length": "7", "berth": "1", "date": "2027-04-10", "nights": "1"})
    assert response.status_code == 303
    assert client.get("/api/bookings").get_json()[0]["boat"] == "Puffin"


def test_the_form_explains_a_refusal(client):
    client.post("/api/bookings", json=KITTIWAKE)
    response = client.post("/book", data={"boat": "Puffin", "length": "7", "berth": "2", "date": "2027-04-11", "nights": "1"})
    assert response.status_code == 409
    assert "Kittiwake is in it" in response.get_data(as_text=True)


def test_the_form_refuses_a_length_that_isnt_a_number(client):
    response = client.post("/book", data={"boat": "Puffin", "length": "seven", "berth": "1", "date": "2027-04-10"})
    assert response.status_code == 400
    assert "length" in response.get_data(as_text=True)
