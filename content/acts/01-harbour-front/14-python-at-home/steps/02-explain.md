---
id: why-venv
type: explain
title: One environment per project
concept: virtual-environments
prompt: "Caitlin's game needs version 1 of a package and Aaesha's charts need version 2. What goes wrong without virtual environments, and what does a virtual environment per project change?"
answer: "Without them, every project shares one set of packages, so installing version 2 for the charts breaks the game. With one environment per project, each has its own packages: the game's .venv keeps version 1 and the charts' keeps version 2."
---
Before you install anything, say it in your own words. It's the reason for the oddest-looking step in the setup.
