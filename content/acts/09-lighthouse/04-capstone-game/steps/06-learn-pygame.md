---
id: learn-pygame
type: learn
title: Drawing a frame in pygame
concept: game-loop
---
**pygame** draws the window. It runs at home, so this one is to read. Here is one frame of `main.py`'s loop:

```python
for event in pygame.event.get():          # what the player did
    if event.type == pygame.QUIT:
        running = False
keys = pygame.key.get_pressed()
game.move(int(keys[pygame.K_RIGHT]) - int(keys[pygame.K_LEFT]))

game.update()                             # one frame of the rules

state = game.state()                      # draw what is, change nothing
screen.fill((20, 30, 60))
pygame.draw.rect(screen, (240, 200, 90), (state["bucket_x"], 440, 40, 20))
screen.blit(font.render(f"Score {state['score']}", True, (255, 255, 255)), (10, 10))
pygame.display.flip()
clock.tick(60)                            # wait for the next frame
```

`pygame.draw.rect` takes a colour, as red, green and blue from 0 to 255, and a rectangle: left, top, width, height. `font.render` turns text into a picture, and `screen.blit` puts it on the screen. `display.flip()` shows the finished frame. `clock.tick(60)` waits, so the game runs at the same speed on every computer.
