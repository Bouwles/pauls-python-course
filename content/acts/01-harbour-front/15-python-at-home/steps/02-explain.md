---
id: why-venv
type: explain
title: One environment per project
concept: virtual-environments
prompt: "Captain Ferro's timetable needs version 1 of a package and Agnes's logbook needs version 2. What goes wrong without virtual environments, and what does a virtual environment per project change?"
answer: "Without them, every project shares one set of packages, so installing version 2 for the logbook breaks the timetable. With one environment per project, each has its own packages: the timetable's .venv keeps version 1 and the logbook's keeps version 2."
---
Before you install anything, say it in your own words. It's the reason for the oddest-looking step in the setup.
