---
id: write-up
type: milestone
title: "Milestone: the write-up"
evidence: none
dialogue:
  - wendt: "Penhallow's notebooks say what she did. Almost never what didn't work. I'd like ours to."
  - moss: "Write it for someone who wasn't here. Then tick only what's true."
checklist:
  - id: drawer
    text: "The 2025 days were opened once, after the model was chosen, and the write-up says so."
    why: "A test you peeked at is a second training set. Saying you didn't is how a reader knows the number means something."
  - id: baselines
    text: "The write-up gives the forecast's 2025 score beside Ferro's rule and always saying no, on the same days."
    why: "Eighty-five in a hundred means nothing on its own. Beside Ferro's seventy-two, it means the forecast earns its keep."
  - id: dawn
    text: "It says which columns were left out because they aren't known at dawn, and why."
    why: "The next person will see boats_out sitting there and try it. Tell them what happens."
  - id: worked
    text: "It says what helped, with cross-validated numbers: which features, and which model."
    why: "A result without the numbers behind it is an opinion. Give the reader the numbers and let them agree."
  - id: did-not
    text: "It says at least one thing you tried that didn't help, or made it worse."
    why: "What failed is the part nobody writes down, and the part that saves the next person a week."
  - id: costs
    text: "It says what precision and recall mean for Gwen's pies and for the fleet, in plain words."
    why: "A wasted pie and a missed good day cost different people different things. Say which mistakes the forecast makes."
  - id: limits
    text: "It says what the forecast can't know, and when it should be checked again."
    why: "The fish moved once and the machine on the hill took a season to notice. Say when someone should look."
  - id: tidy
    text: "Every function has an honest name, and no experiments are left commented out."
    why: "That works. Now make it so the next person can read it."
---
The forecast runs, and it beats the captain on a year it never saw. Now write down how you know.

Replace the docstring at the top of `forecast.py`, in the last step, with your write-up: what the forecast does, the numbers on 2025 beside both baselines, what worked and what didn't, and what it can't know. A page at most. Write it for Gwen and the fleet as much as for the next programmer.

Then go down the list honestly. Moss reads the unticked ones.
