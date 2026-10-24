"""Shared by every test: a fresh app, with its own empty data file, for each test."""
import pytest

from app import create_app


@pytest.fixture
def app(tmp_path):
    return create_app(tmp_path / "harbour-data")


@pytest.fixture
def client(app):
    return app.test_client()
