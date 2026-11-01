---
id: on-screen
type: milestone
title: "Milestone 3: the game on screen"
evidence: link
dialogue:
  - caitlin.pleased.point: "It should look like a pier at night. And the score has to be readable from across the room."
  - riya.thinking: "Navy for the sea, lamplight yellow for the pier, and one red, only for the boots."
checklist:
  - id: state-only
    text: "main.py draws only from game.state(), and changes nothing while it draws."
    why: "If drawing changes the game, the game plays differently on a slower computer."
  - id: steady
    text: "The loop runs at a steady rate with clock.tick, so the game is the same speed on every computer."
    why: "Without it, a fast computer plays a faster game, and Caitlin's new cabinet is fast."
  - id: controls
    text: "The bucket answers the arrow keys straight away, and holding a key keeps it moving."
    why: "A bucket that lags behind the keys feels like wading. Players blame themselves, then the game."
  - id: readable
    text: "Score, lives and level are on screen all the time, big enough to read from a few steps back."
    why: "Players hold a drink in one hand and a joystick in the other. They won't lean in."
  - id: game-over
    text: "Game over shows the score, takes three initials for the table, and offers another go."
    why: "The moment after losing is when people decide whether to play again."
  - id: headless
    text: "python main.py --frames 30 runs without an error, and the agreed test for it passes."
    why: "If it can run without anyone watching, it can be checked without anyone watching."
  - id: credits
    text: "Any picture, sound or font you didn't make is allowed by its licence and credited in the README."
    why: "Somebody made that splash. Their name goes on the cabinet too."
---
Now the window. `main.py` already runs the loop; it draws nothing yet. Give it a `draw(screen, state)` that paints the sea, the pier, the bucket, everything falling, and the score, lives and level, all from `game.state()`.

`pygame.draw.rect` and `pygame.draw.ellipse` are enough for a good-looking pier; pictures are a stretch, not a requirement. `pygame.font.Font(None, 30)` gives a font without hunting for one.

Then game over: the final score, three initials typed in for `scores.py`, and Space to go again. Keep the typing in `main.py`; the rules don't care how initials are typed.

Paste a link to the repository, with a screenshot in the README.
