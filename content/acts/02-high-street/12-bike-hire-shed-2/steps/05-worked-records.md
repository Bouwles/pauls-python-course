---
id: worked-records
type: worked
title: How Moss would keep a record
dialogue:
  - moss: "Old Tom's lamp log. A record for each night, and only three kinds of weather."
code: |
  from dataclasses import dataclass
  from enum import Enum


  class Weather(Enum):
      CLEAR = "clear"
      FOG = "fog"
      STORM = "storm"


  @dataclass(frozen=True)
  class LampCheck:
      """One night's check at the lighthouse."""

      night: int
      weather: Weather
      hours_lit: float = 12.0

      def needs_horn(self) -> bool:
          return self.weather == Weather.FOG


  def foggy_nights(checks: list[LampCheck]) -> int:
      return len([check for check in checks if check.needs_horn()])


  log = [
      LampCheck(1, Weather.CLEAR),
      LampCheck(2, Weather.FOG, 14.5),
      LampCheck(3, Weather.FOG),
  ]
  print(log[1])
  print(foggy_nights(log))
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
A dataclass can have methods like any class. `frozen=True` means a night's record can't be changed once it's written. `list[LampCheck]` is the type hint for a list of lamp checks.

Old Tom says the log hasn't had a STORM since 1987, when the lamp never once went out.
