# Personal Finance App

Sanjay's money, kept properly: every penny in and out, a monthly budget for each kind of spending, and a report that says where it all went. It runs from a terminal and keeps everything in `money.json`.

## Run it

```
python -m finance report 2026-11
python -m finance add 2026-11-22 -3.20 food --note pasty
python -m finance balance
pytest
```
