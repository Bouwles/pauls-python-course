"""Penhallow's bolt rack: one bolt to a drawer, smallest first."""
import bisect

RACK = [3, 3, 4, 5, 5, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 12, 12, 16, 16, 20, 20, 24, 30, 30]


if __name__ == "__main__":
    print(f"Rack: {len(RACK)} drawers, {RACK[0]} mm to {RACK[-1]} mm")
