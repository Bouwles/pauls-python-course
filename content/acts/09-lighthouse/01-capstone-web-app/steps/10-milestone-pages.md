---
id: pages-people-use
type: milestone
title: "Milestone 3: the pages people use"
evidence: link
dialogue:
  - caitlin.laughing.point: "Skippers don't send JSON. They stand on the pontoon and jab at a phone."
  - yahya.unimpressed: "Error 409. Clear enough."
  - riya.thinking: "Not to the skipper of the Kittiwake. Big buttons, plain words, and colours you can read in the rain."
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
Skippers and the berth master use pages, not JSON.

1. Make the front page show every berth and who is in it on the night in `?date=`.
2. Add a form for booking. Turn its fields into numbers and hand them to the same checks the API uses.
3. On success, redirect with 303. On a refusal, say in words which berth, which night and why.
4. Try it on a phone-sized window.
5. Write at least two tests of your own for the pages, through the test client.

Done: every box below ticked, and the agreed page tests pass.
