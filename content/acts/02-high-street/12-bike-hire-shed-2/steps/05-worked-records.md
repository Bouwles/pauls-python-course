---
id: worked-records
type: worked
title: How Paul would keep a record
dialogue:
  - paul: "Yahya's running log. A record for each run, and only three kinds of weather."
code: |
  from dataclasses import dataclass
  from enum import Enum


  class Weather(Enum):
      CLEAR = "clear"
      FOG = "fog"
      STORM = "storm"


  @dataclass(frozen=True)
  class Run:
      """One of Yahya's morning runs."""

      day: int
      weather: Weather
      km: float = 5.0

      def needs_lights(self) -> bool:
          return self.weather == Weather.FOG


  def foggy_runs(runs: list[Run]) -> int:
      return len([run for run in runs if run.needs_lights()])


  log = [
      Run(1, Weather.CLEAR),
      Run(2, Weather.FOG, 7.5),
      Run(3, Weather.FOG),
  ]
  print(log[1])
  print(foggy_runs(log))
subgoals:
  - label: List the choices
    lines: [5, 8]
  - label: Describe one record, frozen, with types
    lines: [11, 17]
  - label: Add behaviour as methods
    lines: [19, 20]
  - label: Functions take and give typed values
    lines: [23, 24]
  - label: Make records and use them
    lines: [27, 33]
explain:
  prompt: "Why is `weather` a `Weather`, and not a string like `\"fog\"`?"
  answer: "A string could be \"Fog\", \"foggy\" or \"fgo\", and a typo would quietly never match. `Weather` has exactly three members, and a misspelt one is an error the first time the line runs."
  concept: enums
---
A dataclass can have methods like any class. `frozen=True` means a run's record can't be changed once it's written. `list[Run]` is the type hint for a list of runs.

Yahya's log has no STORM runs in it yet. He says that's a choice, not luck.
