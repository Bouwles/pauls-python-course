---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Riya paints while it's light. So, a daylight board for Penzance, from a saved reply."
code: |
  import json

  # Paul's daylight board, worked from a saved reply.
  SAVED = "daylight.json"


  def fetch_daylight():
      """The one place the data comes from. Today a file; one day, the internet."""
      with open(SAVED) as file:
          return json.load(file)


  def daylight_lines(reply):
      """One line per day from a daylight reply. A missing field raises KeyError."""
      daily = reply["daily"]
      lines = []
      for day, rise, dark, seconds in zip(daily["time"], daily["sunrise"], daily["sunset"], daily["daylight_duration"]):
          hours, minutes = divmod(round(seconds / 60), 60)
          lines.append(f"{day}: light from {rise[-5:]} to {dark[-5:]}, {hours} h {minutes} min")
      return lines


  def main():
      try:
          lines = daylight_lines(fetch_daylight())
      except OSError:
          print("Can't get the daylight times.")
          return
      except KeyError as error:
          print(f"The reply came back without {error}.")
          return
      for line in lines:
          print(line)


  if __name__ == "__main__":
      main()
subgoals:
  - label: Ask for the data in one place
    lines: [7, 10]
  - label: Walk the lists of daily values together with zip
    lines: [13, 17]
  - label: Turn each day into a line
    lines: [18, 20]
  - label: Catch what can go wrong, by name
    lines: [24, 31]
  - label: Print only once everything has arrived
    lines: [32, 33]
explain:
  prompt: "`daylight_lines` is handed the reply. Why doesn't it open the file itself?"
  answer: "Then anything can hand it a reply: the saved file, the internet, or a check with a made-up one. It can be tested without the internet, and when the data starts coming from Open-Meteo, only fetch_daylight has to change."
  concept: web-apis
---
Paul's daylight board takes the same steps as Riya's forecast, from a saved reply. `fetch_daylight` is the one place the data comes from; everything else is handed what came back.

`except OSError` catches the file going missing as well as the internet going down, since `FileNotFoundError` is one of the family. `except KeyError as error` keeps the missing key, in quotes. `divmod(a, b)` gives `a // b` and `a % b` together. The lines aren't printed until every one has been made, so a reply that fails halfway doesn't leave half a board.

The labels beside the code are the steps he took. They're the comments in your file.
