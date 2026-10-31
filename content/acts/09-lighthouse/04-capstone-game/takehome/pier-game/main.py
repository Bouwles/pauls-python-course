"""Mackerel Night, on screen. Start it with:   python main.py

Left and right arrows move the bucket. Escape quits.

python main.py --frames 30 plays thirty frames and stops; the tests use it.
"""

import argparse

import pygame

from pier import HEIGHT, WIDTH, Game

FPS = 60
SEA = (24, 52, 74)


def main(frames=None):
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Mackerel Night")
    clock = pygame.time.Clock()
    game = Game()
    frame = 0
    running = True
    while running and (frames is None or frame < frames):
        # Input
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False
        keys = pygame.key.get_pressed()
        game.move(int(keys[pygame.K_RIGHT]) - int(keys[pygame.K_LEFT]))

        # Update
        game.update()

        # Draw, from game.state() and nothing else: the bucket, everything
        # falling, the score, the lives and the level
        screen.fill(SEA)

        pygame.display.flip()
        clock.tick(FPS)
        frame += 1
    pygame.quit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mackerel Night, Caitlin's game for the Arcade.")
    parser.add_argument("--frames", type=int, help="stop after this many frames")
    main(parser.parse_args().frames)
