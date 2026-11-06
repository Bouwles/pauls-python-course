---
id: worked-records
type: worked
title: How Paul would keep a record
dialogue:
  - paul.neutral: "Neil's flight log. A record for each drone flight, and only three kinds of weather."
code: |
  from dataclasses import dataclass
  from enum import Enum


  class Weather(Enum):
      CLEAR = "clear"
      FOG = "fog"
      STORM = "storm"


  @dataclass(frozen=True)
  class Flight:
      """One of Neil's drone flights."""

      day: int
      weather: Weather
      minutes: float = 5.0

      def needs_lights(self) -> bool:
          return self.weather == Weather.FOG


  def foggy_flights(flights: list[Flight]) -> int:
      return len([flight for flight in flights if flight.needs_lights()])


  log = [
      Flight(1, Weather.CLEAR),
      Flight(2, Weather.FOG, 7.5),
      Flight(3, Weather.FOG),
  ]
  print(log[1])
  print(foggy_flights(log))
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
Paul's flight record uses all three ideas: an Enum for the weather, a dataclass for each flight, and type hints throughout. A dataclass can have methods like any class.

`@dataclass(frozen=True)` makes a record that can't be changed once it's made. Neil's books go out and come back, so his won't be frozen.

The labels beside the code are the steps Paul took. Neil's log has no STORM flights in it yet. He says that's a choice, not luck.
