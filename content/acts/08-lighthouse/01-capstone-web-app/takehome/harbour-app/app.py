"""Saltmarsh Harbour's visitor berths: a web app for Agnes Rook.

Start it with:   flask --app app run --debug
then open http://127.0.0.1:5000 in a browser. Ctrl+C stops it.
"""
# Pencilled inside the door of the old server cabinet under the lighthouse
# stairs, and copied here by Agnes:
# Every address on this server answers in under a second but one, and that
# one goes up to the lamp room. Tom keeps the key. Ask him nicely, and not
# before you're ready. A.P.

from flask import Flask, jsonify, render_template

from berths import BERTHS


def create_app(data_file="bookings.json"):
    """Make the app. data_file is where the bookings are kept between runs:
    a JSON file or an SQLite database, whichever you choose. The tests give
    every app a data file of its own."""
    app = Flask(__name__)
    app.config["DATA_FILE"] = str(data_file)

    @app.get("/")
    def front_page():
        return render_template("index.html", berths=BERTHS)

    @app.get("/api/berths")
    def list_berths():
        return jsonify(BERTHS)

    # Agnes's other routes go here: the list is in BRIEF.md.
    # request.get_json() answers anything that isn't JSON with an error page
    # of its own; request.get_json(silent=True) gives you None instead, so
    # you can answer with Agnes's 400 and a JSON message.

    return app
