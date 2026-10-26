---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "No loops anywhere. I made it fast first. That's the right order, isn't it."
  - pip: "Three hundred and ninety-five students and three averages. Priya will want the other three hundred and ninety-two."
dialogue_after:
  - pip: "So the axis you name is the one that goes. I had both of them backwards. Consistent, at least."
hints:
  nudge: "Which axis has to disappear to leave one number per student: the rows, or the columns?"
  plan:
    - Run it and read the two shapes
    - Work out which axis each function should collapse
    - Swap the axes
  shape: |
    def student_means(marks):
        return marks.mean(axis=___)


    def assessment_means(marks):
        return marks.mean(axis=___)
---
Pip has started on the grade book: an average for each student and an average for each assessment.

`axis=0` runs down the rows, across all the students. `axis=1` runs along each row, across one student's three marks. Whichever axis you name gets averaged away and disappears.

Run it, read the shapes, and fix it.
