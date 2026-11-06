---
id: learn-fixtures
type: learn
title: A fresh app for every test
concept: pytest
---
Every test of a web app needs an app to send requests to, and each wants its own, with an empty data file, so no test sees another's bookings. Writing that setup in every test would be a lot of copying. pytest has a tool for it, the **fixture**.

```python
import pytest

from app import create_app


@pytest.fixture
def client(tmp_path):
    return create_app(tmp_path / "marina-data").test_client()


def test_no_bookings_yet(client):
    assert client.get("/api/bookings").get_json() == []
```

A fixture is a function marked `@pytest.fixture`. A test that names it as a parameter, like `client` here, is handed a fresh one each time it runs. `tmp_path` is a fixture pytest provides: a new empty folder for each test.

The project's fixtures live in `tests/conftest.py`, where every test file can use them. Your own tests just ask for `client`.
