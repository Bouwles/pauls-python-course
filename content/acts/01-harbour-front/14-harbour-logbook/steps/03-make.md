---
id: make
type: make
title: Make the harbour logbook
timeout_ms: 15000
on_pass: { agnes: "Requirement eight: it does not lose any. I tried quite hard. It doesn't." }
hints:
  nudge: "What does the program have to remember from one choice to the next? Set that up before the loop starts."
  plan:
    - Decide what the program remembers
    - Tidy a name
    - "The menu loop: ask, branch, go round again"
    - One function per option
    - Quit properly
    - Try to break it
  shape: |
    def tidy(name):
        return name.___().___()

    def log_out(boat, out):
        if boat in out:
            print(f"{boat} is already out.")
        else:
            out.___(boat)
            print(f"{boat} logged out.")

    def log_in(boat, out, trips):
        if boat ___ out:
            print(f"{boat} isn't out.")
        else:
            out.___(boat)
            trips[boat] = trips.___(boat, 0) + 1
            print(f"{boat} logged in.")

    def report(out, trips):
        ___

    def main():
        out = []
        trips = {}
        while True:
            choice = input("1 out, 2 in, 3 report, 4 quit: ")
            ___

    if __name__ == "__main__":
        main()
---
Build the logbook to Agnes's eight requirements, under **The job**. Moss's envelope is the plan. The file is empty apart from an old note.

The checks type whole days at it: boats out and in, reports, wrong numbers and blank names. When one fails, read its inputs. That's the day Agnes had.

Run it yourself first and try to break it. It's quicker than waiting for the checks to.
