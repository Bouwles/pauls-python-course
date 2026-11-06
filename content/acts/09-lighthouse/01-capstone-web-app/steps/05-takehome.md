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
Download the project: a Flask skeleton with `app.py` (two routes working), `berths.py`, one page in `templates/`, and the 25 agreed tests in `tests/`. Three pass already.

1. Put your `rules.py` from the last step beside `app.py`. The routes will call it, and so will the form.
2. Work through the four milestones below, with the project open.
3. Put your own tests in `tests/test_mine.py`. They ask for the `client` fixture.

Done: `pytest` passes every test, the agreed ones and yours. Then hand the report in here.

```console
(.venv) $ pytest -x
```

`-x` stops at the first failure, which is usually the one worth reading.
