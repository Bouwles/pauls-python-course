# Mrs Vance's donations box.
import csv
from pathlib import Path

FIELDS = ["title", "author", "year", "shelf"]


def load_books(path):
    # No file yet: start with an empty list
    # Read the rows as dictionaries, inside with
    pass


def save_books(path, books):
    # Write the header, then every row
    pass


# Load, change, save:
# 1. Load the catalogue and the donations
# 2. No donations: say so, and leave the catalogue alone
# 3. Add each donation unless its title is already catalogued
# 4. Save the catalogue, then say how many books it has
