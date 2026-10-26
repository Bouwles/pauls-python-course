"""The fishing forecast: good fishing or not, from what's known at dawn."""
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from features import add_features, feature_table, load_days

TEST_YEAR = 2025


def split_by_year(days, year):
    years = days["date"].str[:4].astype(int)
    return days[years < year], days[years == year]


def ferros_rule(days):
    return ((days["tide_range"] >= 4.0) & (days["wind_speed"] < 20)).astype(int).to_numpy()


def always_commonest(y_train, y_test):
    commonest = np.bincount(np.asarray(y_train)).argmax()
    return np.mean(np.asarray(y_test) == commonest)


def candidate_models():
    return {
        "logistic": make_pipeline(StandardScaler(), LogisticRegression()),
        "forest": RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=0),
        "boosting": GradientBoostingClassifier(random_state=0),
    }


def cross_validated(models, X, y, folds):
    return {name: cross_val_score(model, X, y, cv=folds).mean() for name, model in models.items()}


def precision_recall(y_true, y_pred):
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    caught = np.sum((y_pred == 1) & (y_true == 1))
    return caught / np.sum(y_pred == 1), caught / np.sum(y_true == 1)


if __name__ == "__main__":
    days = add_features(load_days("fishing.csv"))

    # Lock the last year away
    train_days, test_days = split_by_year(days, TEST_YEAR)
    X_train, y_train = feature_table(train_days)
    X_test, y_test = feature_table(test_days)
    print(f"Training days: {len(X_train)}, test days: {len(X_test)}")

    # Choose a model by cross-validation
    models = candidate_models()
    scores = cross_validated(models, X_train, y_train, 5)
    for name, score in scores.items():
        print(f"{name:<10} {score:.3f}")
    chosen = max(scores, key=scores.get)
    print(f"Chosen: {chosen}")

    # Open the last year, once, beside the baselines
    model = models[chosen].fit(X_train, y_train)
    predicted = model.predict(X_test)
    print(f"On {TEST_YEAR}: {np.mean(predicted == y_test):.3f}")
    print(f"Ferro's rule: {np.mean(ferros_rule(test_days) == y_test):.3f}")
    print(f"Always saying no: {always_commonest(y_train, y_test):.3f}")

    # The mistakes that cost Gwen and the fleet
    precision, recall = precision_recall(y_test, predicted)
    print(f"When it says good, it's right: {precision:.2f}")
    print(f"Good days it caught: {recall:.2f}")
