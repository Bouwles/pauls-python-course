---
id: make
type: make
title: Make the grade book
on_pass: { yahya.surprised.thumbs: "Thirty-eight finals more than two deviations down. Every one of them a nought." }
hints:
  nudge: "Which axis disappears to leave one number per assessment? And what shape is `target - assessment_means(marks)`?"
  plan:
    - Average along each row for the students, down each column for the assessments
    - Work out each assessment's lift, add it to every row at once, then clip
    - Take the averages off and divide by the spreads, both one number per column
    - Compare the first column with the last, all students at once
    - Turn each final into a group number, then the group number into a letter
  shape: |
    def student_means(marks):
        return marks.mean(axis=___)


    def assessment_means(marks):
        return marks.mean(axis=___)


    def curve(marks, target):
        lift = target - ___
        return np.clip(marks + lift, ___, ___)


    def z_scores(marks):
        return (marks - assessment_means(marks)) / marks.___(axis=0)


    def dropped(marks, by):
        return marks[:, 0] - marks[:, ___] >= by


    def bands(final):
        letters = np.array(["F", "D", "C", "B", "A"])
        return letters[np.digitize(final, [___])]
---
Write the grade book's six functions. `load_marks` and the report are done.

```
395 students, 3 assessments
Average by assessment: [10.9 10.7 10.4]
Best average: student 48, 19.3
After a curve to 12: [12. 12. 12.]
Finals more than two deviations below average: 38
Dropped 3 marks or more, first to final: 47
Final bands: A 40, B 60, C 62, D 103, F 130
```

New tools:

- `np.clip(a, 0, 20)` raises anything below 0 to 0 and cuts anything above 20 to 20.
- `a.std(axis=0)` is each column's standard deviation: roughly, how far a mark usually sits from its average. A z-score is a mark minus its average, divided by that.
- `np.digitize(final, [10, 12, 14, 16])` gives each mark a group number: 0 below 10, up to 4 from 16. An array of letters indexed by those numbers gives a letter each.

The checks try other classes, and look for loops.
