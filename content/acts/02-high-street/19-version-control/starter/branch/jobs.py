# The Workshop's job tracker. Paul adds jobs; the list prints in order of urgency.

JOBS = [
    ("Neil's kettle", 2),
    ("Printer script", 1),
    ("Tower clock", 3),
]


def by_urgency(jobs):
    return sorted(jobs, key=lambda job: job[1])


if __name__ == "__main__":
    for name, urgency in by_urgency(JOBS):
        print(urgency, name)
