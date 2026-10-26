"""{{town}} Harbour's visitor berths: a web app for Agnes Rook.

Start it with:   flask --app app run
then open http://127.0.0.1:5000 in a browser. Ctrl+C stops it.
Add --debug while you're working on it, and only then.
"""
# Pencilled inside the door of the old server cabinet under the lighthouse
# stairs, and copied here by Agnes:
# Every address on this server answers in under a second but one, and that
# one goes up to the lamp room. Tom keeps the key. Ask him nicely, and not
# before you're ready. A.P.

from datetime import date

from flask import Flask, jsonify, redirect, render_template, request, url_for

from berths import BERTHS
from bookings import Bookings
from rules import BookingError, parse_date


def from_form(form):
    """A booking typed into the page's form, with numbers made numbers where they can be."""
    def number(text, kind):
        try:
            return kind(text)
        except (TypeError, ValueError):
            return text

    return {"boat": form.get("boat", ""), "length": number(form.get("length"), float),
            "berth": number(form.get("berth"), int), "date": form.get("date", ""),
            "nights": number(form.get("nights", "1"), int)}


def create_app(data_file="bookings.json"):
    """Make the app. data_file is where the bookings are kept between runs."""
    app = Flask(__name__)
    bookings = Bookings(data_file)

    def error(message, status):
        return jsonify({"error": message}), status

    @app.get("/")
    def front_page():
        night = parse_date(request.args.get("date", "")) or date.today()
        staying = {b["berth"]: b for b in bookings.all(night)}
        booked = bookings.get(request.args.get("booked", type=int))
        return render_template("index.html", berths=BERTHS, night=night, staying=staying, booked=booked, problem=None)

    @app.post("/book")
    def book_from_the_page():
        try:
            booking = bookings.add(from_form(request.form))
        except BookingError as refused:
            night = parse_date(request.form.get("date", "")) or date.today()
            staying = {b["berth"]: b for b in bookings.all(night)}
            page = render_template("index.html", berths=BERTHS, night=night, staying=staying, booked=None, problem=refused.message)
            return page, refused.status
        return redirect(url_for("front_page", date=booking["date"], booked=booking["id"]), code=303)

    @app.get("/api/berths")
    def list_berths():
        return jsonify(BERTHS)

    @app.get("/api/bookings")
    def list_bookings():
        night_text = request.args.get("date")
        if night_text is None:
            return jsonify(bookings.all())
        night = parse_date(night_text)
        if night is None:
            return error("The date should be a real date, written YYYY-MM-DD.", 400)
        return jsonify(bookings.all(night))

    @app.post("/api/bookings")
    def make_booking():
        try:
            booking = bookings.add(request.get_json(silent=True))
        except BookingError as refused:
            return error(refused.message, refused.status)
        return jsonify(booking), 201

    @app.get("/api/bookings/<int:booking_id>")
    def show_booking(booking_id):
        booking = bookings.get(booking_id)
        if booking is None:
            return error(f"There's no booking {booking_id}.", 404)
        return jsonify(booking)

    @app.delete("/api/bookings/<int:booking_id>")
    def cancel_booking(booking_id):
        if not bookings.cancel(booking_id):
            return error(f"There's no booking {booking_id}.", 404)
        return "", 204

    return app
