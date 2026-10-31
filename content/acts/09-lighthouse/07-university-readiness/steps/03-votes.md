---
id: votes
type: make
title: "Question 2: Naming the boat"
files: [votes.py]
entry: votes.py
on_pass: { riya: "Gannet, by the third slip. The marina will be pleased. It's a good name for a boat." }
hints:
  nudge: "Going through the slips one at a time, what do you need to remember to know who's winning so far?"
  plan:
    - A dictionary of counts, empty
    - For each slip, add one to that name's count
    - If that count is now more than the best so far, this name takes the lead
    - "A name that only draws level doesn't take the lead: it got there second"
    - Hand back the leader, which is still None if there were no slips
  shape: |
    def winner(ballots):
        counts = {}
        leader = None
        most = 0
        for name in ballots:
            counts[name] = counts.___(name, 0) + 1
            if counts[name] ___ most:
                most = ___
                leader = ___
        return leader
---
The marina from Riya's capstone is naming its new safety boat. Every vote is a name on a slip, read out in the order the slips come out of the box.

Write `winner(ballots)`: the name with the most votes. On a tie, the winner is the name that reached the winning number of votes first, counting slips in order. With no ballots, return `None`.

**Limits:** up to 200,000 ballots. Names are compared exactly: `"Gull"` and `"gull"` are different boats.

```
winner(["Gull", "Tern", "Gull"])                                    gives "Gull"
winner(["Kittiwake", "Gannet", "Gannet", "Kittiwake", "Puffin"])    gives "Gannet"
```

In the second, Kittiwake and Gannet both end on two votes. Gannet's second vote is the third slip; Kittiwake's is the fourth.
