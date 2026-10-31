"""Mackerel Night, on screen. Start it with:   python main.py

Left and right arrows move the bucket. When the game is over, type your
initials and press Enter, then Space to play again. Escape quits.

python main.py --frames 30 plays thirty frames and stops; the tests use it.
"""

import argparse

import pygame

from pier import BUCKET_HEIGHT, BUCKET_WIDTH, BUCKET_Y, HEIGHT, ITEM_SIZE, WIDTH, Game
from scores import add_score, top_scores

FPS = 60
SCORES_FILE = "scores.json"
SEA, PIER, BUCKET, MACKEREL, BOOT, INK = (24, 52, 74), (120, 92, 60), (200, 200, 190), (170, 200, 215), (70, 45, 30), (245, 240, 225)


def draw(screen, font, state, initials, saved, best):
    """One frame, drawn from the game's state and nothing else."""
    screen.fill(SEA)
    pygame.draw.rect(screen, PIER, (0, BUCKET_Y + BUCKET_HEIGHT, WIDTH, HEIGHT - BUCKET_Y - BUCKET_HEIGHT))
    pygame.draw.rect(screen, BUCKET, (state["bucket_x"], BUCKET_Y, BUCKET_WIDTH, BUCKET_HEIGHT), border_radius=4)
    for item in state["items"]:
        if item["kind"] == "mackerel":
            pygame.draw.ellipse(screen, MACKEREL, (item["x"], item["y"] + 6, ITEM_SIZE, ITEM_SIZE - 12))
        else:
            pygame.draw.rect(screen, BOOT, (item["x"], item["y"], ITEM_SIZE, ITEM_SIZE))
    screen.blit(font.render(f"Score {state['score']}   Lives {state['lives']}   Level {state['level']}", True, INK), (12, 10))
    if state["over"]:
        lines = ["Out of boots, and out of luck.", f"Score {state['score']}"]
        lines.append("Saved. Space to play again." if saved else f"Initials: {initials}_  then Enter")
        lines += ["", "Best on the pier:"] + [f"{name}  {score}" for name, score in best]
        for row, line in enumerate(lines):
            text = font.render(line, True, INK)
            screen.blit(text, ((WIDTH - text.get_width()) // 2, 180 + row * 32))


def main(frames=None):
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Mackerel Night")
    font = pygame.font.Font(None, 30)
    clock = pygame.time.Clock()
    game, initials, saved = Game(), "", False
    best = top_scores(SCORES_FILE)
    frame = 0
    running = True
    while running and (frames is None or frame < frames):
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False
            elif event.type == pygame.KEYDOWN and game.over:
                if saved and event.key == pygame.K_SPACE:
                    game, initials, saved = Game(), "", False
                elif not saved and event.key == pygame.K_RETURN and initials:
                    add_score(SCORES_FILE, initials, game.score)
                    best, saved = top_scores(SCORES_FILE), True
                elif not saved and event.key == pygame.K_BACKSPACE:
                    initials = initials[:-1]
                elif not saved and event.unicode.isalpha() and len(initials) < 3:
                    initials += event.unicode.upper()
        keys = pygame.key.get_pressed()
        game.move(int(keys[pygame.K_RIGHT]) - int(keys[pygame.K_LEFT]))
        game.update()
        draw(screen, font, game.state(), initials, saved, best)
        pygame.display.flip()
        clock.tick(FPS)
        frame += 1
    pygame.quit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mackerel Night, Caitlin's game for the Arcade.")
    parser.add_argument("--frames", type=int, help="stop after this many frames")
    main(parser.parse_args().frames)
