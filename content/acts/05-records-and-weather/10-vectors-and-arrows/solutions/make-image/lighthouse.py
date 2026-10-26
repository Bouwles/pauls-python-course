"""Linear Algebra Lab, part two: a photograph as a matrix, and turning things with matrices."""
import matplotlib.pyplot as plt
import numpy as np

IMAGE_FILE = "lighthouse.csv"

# The keeper's house, as the corners of its outline: (column, row) from the bottom left.
HOUSE = np.array([[0.0, 0.0], [20.0, 0.0], [20.0, 8.0], [10.0, 12.0], [0.0, 8.0]])


def load_image(path):
    """The photograph: one row of numbers per row of pixels, 0 for black up to 255 for white."""
    return np.loadtxt(path, delimiter=",")


def mirror(image):
    """The picture as seen in a mirror: each row back to front."""
    return image[:, ::-1]


def upside_down(image):
    """The picture upside down: the rows in reverse order."""
    return image[::-1]


def quarter_turn(image):
    """The picture turned a quarter turn clockwise."""
    return upside_down(image).T


def brighten(image, amount):
    """Every pixel amount brighter, kept between 0 and 255."""
    return np.clip(image + amount, 0, 255)


def blur(image):
    """Each pixel the average of the 3 by 3 block around it; the edges repeat themselves."""
    padded = np.pad(image, 1, mode="edge")
    rows, cols = image.shape
    total = np.zeros(image.shape)
    for down in range(3):
        for across in range(3):
            total = total + padded[down:down + rows, across:across + cols]
    return total / 9


def rotation(degrees):
    """The 2 by 2 matrix that turns an arrow degrees anticlockwise."""
    angle = np.radians(degrees)
    return np.array([[np.cos(angle), -np.sin(angle)],
                     [np.sin(angle), np.cos(angle)]])


def turn_points(points, degrees):
    """Every point, one (x, y) per row, turned degrees anticlockwise about (0, 0)."""
    return points @ rotation(degrees).T


if __name__ == "__main__":
    image = load_image(IMAGE_FILE)
    rows, cols = image.shape
    print(f"Cape Lookout: {rows} rows by {cols} columns, brightness {image.min():.0f} to {image.max():.0f}")
    print(f"Turned a quarter: {quarter_turn(image).shape[0]} rows by {quarter_turn(image).shape[1]} columns")
    print(f"Brightened by 60: average {brighten(image, 60).mean():.1f}, against {image.mean():.1f}")
    print(f"Blurred: brightness {blur(image).min():.0f} to {blur(image).max():.0f}")
    there_and_back = turn_points(turn_points(HOUSE, 30), -30)
    print(f"House turned 30 degrees and back: {np.allclose(there_and_back, HOUSE)}")
    print("Roof, turned 90 degrees:", turn_points(HOUSE, 90)[3].round(1))

    fig, axes = plt.subplots(1, 4, figsize=(12, 4))
    for ax, picture, title in zip(axes, [image, mirror(image), quarter_turn(image), blur(image)],
                                  ["as taken", "mirrored", "a quarter turn", "blurred"]):
        ax.imshow(picture, cmap="grey", vmin=0, vmax=255)
        ax.set_title(title)
        ax.axis("off")
    fig.suptitle("Cape Lookout lighthouse. Photograph: Mrmichaeltomato, CC0, Wikimedia Commons")
    plt.show()
