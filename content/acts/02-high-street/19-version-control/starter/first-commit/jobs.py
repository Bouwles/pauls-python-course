# The workshop's job tracker. Moss adds jobs; the list prints in order of urgency.

JOBS = [
    ("Bea's till", 2),
    ("Tide script", 1),
    ("Fog horn", 3),
]


def by_urgency(jobs):
    return sorted(jobs, key=lambda job: job[1])


if __name__ == "__main__":
    for name, urgency in by_urgency(JOBS):
        print(urgency, name)
