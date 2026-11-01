---
id: make-forecast
type: make
title: Make the forecast
files: [features.py, forecast.py]
entry: forecast.py
starter_from: make-features
timeout_ms: 60000
on_pass: { paul.proud: "Right four times in five when it says good. The café can cook to that." }
hints:
  nudge: "Which days may the cross-validation see, and when, exactly, do the 2025 days get looked at?"
  plan:
    - Engineer the features
    - Lock the last year away
    - Choose a model by cross-validation
    - Fit it on every training day
    - Open the last year, once, beside the baselines
    - The mistakes that cost the café and the fleet
  shape: |
    def split_by_year(days, year):
        years = days["date"].str[:4].astype(___)
        return days[years ___ year], days[years ___ year]


    def skippers_rule(days):
        return ((days["tide_range"] >= ___) & (days["wind_speed"] < ___)).astype(int).to_numpy()


    def precision_recall(y_true, y_pred):
        caught = np.sum((y_pred == 1) & (y_true == 1))
        return caught / np.sum(___ == 1), caught / np.sum(___ == 1)
---
`forecast.py` starts with one import from your features. Write:

```text
TEST_YEAR = 2025
split_by_year(days, year)   (train, test): the days before that year, and
                            the days in it
skippers_rule(days)         an array: 1 where tide_range is 4.0 or more and
                            wind_speed is under 20, else 0
always_commonest(y_train, y_test)
                            accuracy on y_test of always guessing the
                            commonest answer in y_train
candidate_models()          three unfitted models, by name:
  "logistic"   StandardScaler, then LogisticRegression()
  "forest"     RandomForestClassifier(n_estimators=200, min_samples_leaf=5,
               random_state=0)
  "boosting"   GradientBoostingClassifier(random_state=0)
cross_validated(models, X, y, folds)
                            each name and its mean accuracy over the folds
precision_recall(y_true, y_pred)
                            (precision, recall) for the good days
```

Run as a program: engineer, split, cross-validate with 5 folds, choose, fit, then open 2025 once.

```text
Training days: 730, test days: 365
logistic   0.860
forest     0.842
boosting   0.853
Chosen: logistic
On 2025: 0.852
Skipper's rule: 0.723
Always saying no: 0.575
When it says good, it's right: 0.81
Good days it caught: 0.85
```
