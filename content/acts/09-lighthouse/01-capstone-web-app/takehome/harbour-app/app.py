"""The marina's visitor berths: a web app, built for Caitlin's client.

Start it with:   flask --app app run
then open http://127.0.0.1:5000 in a browser. Ctrl+C stops it.
Add --debug while you're working on it, and only then.
"""

from flask import Flask, jsonify, render_template

from berths import BERTHS

# The marina's rules: put the rules.py you wrote before downloading this beside
# app.py, and import what you need from it here.


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

    # The other agreed routes go here: the list is in BRIEF.md.
    # request.get_json() answers anything that isn't JSON with an error page
    # of its own; request.get_json(silent=True) gives you None instead, so
    # you can answer with the agreed 400 and a JSON message.

    return app
