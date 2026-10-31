---
id: pages-people-use
type: milestone
title: "Milestone 3: the pages people use"
evidence: link
dialogue:
  - riya: "Skippers don't send JSON. They stand on the pontoon and jab at a phone."
  - yahya: "Error 409. Clear enough."
  - riya: "Not to the skipper of the Kittiwake."
checklist:
  - id: front
    text: "The front page shows every berth and who is in it on the chosen night, readable without knowing what JSON is."
    why: "This is the page the berth master opens every morning. It has to answer the question before it's asked."
  - id: form
    text: "A skipper can book from a form, and a refusal says which berth, which night and why."
    why: "'Error 409' means nothing on a wet pontoon. 'Pontoon B is taken on the 11th by the Kittiwake' does."
  - id: one-rulebook
    text: "The form goes through the same checks as the API: one set of rules, not two."
    why: "Two copies of a rule drift apart, and the day they disagree is the day a boat turns up."
  - id: redirect
    text: "After a successful booking, the page redirects, so refreshing it doesn't book twice."
    why: "Someone will press refresh. Somebody always does."
  - id: escaped
    text: "Names typed into the form appear on the page as text, never as HTML, and the agreed test for it passes."
    why: "Someone will call their boat `<script>`. Flask's templates escape it for you, if you let them do the work."
  - id: phone
    text: "The pages are usable on a phone screen."
    why: "The berth master reads it on the pontoon, holding a clipboard in the other hand."
  - id: page-tests
    text: "At least two of your own tests check the pages through the test client."
    why: "A page is a route like any other. If it isn't tested, it's broken and nobody knows yet."
---
`render_template("index.html", berths=BERTHS)` fills a template in `templates/` with your values. Templates escape what they show, so a boat named `<b>Bold</b>` is shown as those characters, not as bold text. Build HTML with f-strings instead and you lose that.

A form with `method="post"` sends its fields to a route as `request.form`, and every field arrives as text, numbers included. Turn them into numbers, then hand them to the same checks the API uses, so a booking is judged the same way wherever it comes from.

After a booking succeeds, answer with `redirect(url_for(...), code=303)`. The browser then asks for the page afresh, and refreshing it asks again for the page, not for the booking.
