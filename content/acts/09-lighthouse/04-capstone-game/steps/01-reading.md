---
id: round-and-round
type: reading
title: Sixty times a second
dialogue:
  - moss: "A game is a loop that never stops asking what happened, and drawing the answer."
code: |
  clock = pygame.time.Clock()
  game = Game()
  running = True
  while running:
      for event in pygame.event.get():              # 1. what the player did
          if event.type == pygame.QUIT:
              running = False
      keys = pygame.key.get_pressed()
      game.move(int(keys[pygame.K_RIGHT]) - int(keys[pygame.K_LEFT]))

      game.update()                                 # 2. one step of the rules

      draw(screen, game.state())                    # 3. draw what is, change nothing
      pygame.display.flip()

      clock.tick(60)                                # 4. wait for the next frame
---
Every game is the same loop: read the input, update the rules by one step, draw, wait. Round it goes, sixty times a second. Each pass is a **frame**, and speeds are counted per frame: four pixels a frame is 240 pixels a second.

The important line is the one between steps 2 and 3. `update()` belongs to the rules: it knows where everything is and what happens when things meet, but nothing about screens, keys or colours. Drawing belongs to `main.py`: it reads `game.state()` and paints it, and changes nothing.

Keep that line and the rules can be tested without a window. A test can play ten thousand frames in a blink, drop a boot exactly over the bucket, or replay Saturday's game from its seed. Cross it, and every test needs a screen.

This page's code runs at home, with pygame. First, the same rules in text, here.
