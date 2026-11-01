---
id: harbour-app
type: takehome
title: The marina's project
python: "3.10"
requirements: [flask]
heavy: true
setup: |
  Flask runs a small web server on your own computer. In the project folder, `flask --app app run` starts it; open http://127.0.0.1:5000 in a browser, and stop it with Ctrl+C. pytest doesn't need the server running: the tests use Flask's test client.
dialogue:
  - aaesha.neutral.point: "The routes are agreed. The tests are the agreement. Nobody edits the agreement."
---
The project is a Flask skeleton: `app.py` with two routes working, `berths.py`, one page in `templates/`, and the agreed tests in `tests/`. Three of the 25 agreed tests pass already.

First, put your `rules.py` from the last step beside `app.py`. The routes will call it, and so will the form.

Your own tests go in `tests/test_mine.py`, which has one to start you off. They can use the `client` fixture from `tests/conftest.py`, which gives every test a fresh app with an empty data file of its own.

Download it now, and keep it open through the milestones. When every test passes, yours included, hand the report in here.

```console
(.venv) $ pytest -x
```

`-x` stops at the first failure, which is usually the one worth reading.
