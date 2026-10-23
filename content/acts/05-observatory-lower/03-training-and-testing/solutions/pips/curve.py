# Pip's mirror curve. Tuesday's readings to learn from, Wednesday's to check.
import numpy as np

readings = np.loadtxt("cooling.csv", delimiter=",", skiprows=1)
hours = readings[:, 1]
difference = readings[:, 2]

tuesday_hours, tuesday = hours[:12], difference[:12]
wednesday_hours, wednesday = hours[12:24], difference[12:24]


def polynomial_features(x, degree):
    """Columns x ** 0, x ** 1, ... up to x ** degree."""
    return np.column_stack([x ** power for power in range(degree + 1)])


def fit_polynomial(x, y, degree):
    return np.linalg.lstsq(polynomial_features(x, degree), y, rcond=None)[0]


def mse(predicted, actual):
    return np.mean((predicted - actual) ** 2)


def choose_degree(x_train, y_train, x_val, y_val, degrees):
    """The degree whose curve does best on readings it wasn't fitted to."""
    errors = []
    for degree in degrees:
        weights = fit_polynomial(x_train, y_train, degree)
        errors.append(mse(polynomial_features(x_val, degree) @ weights, y_val))
    return degrees[int(np.argmin(errors))]


if __name__ == "__main__":
    degree = choose_degree(tuesday_hours, tuesday, wednesday_hours, wednesday, list(range(1, 12)))
    weights = fit_polynomial(tuesday_hours, tuesday, degree)
    tuesday_error = mse(polynomial_features(tuesday_hours, degree) @ weights, tuesday)
    wednesday_error = mse(polynomial_features(wednesday_hours, degree) @ weights, wednesday)
    print(f"Chosen degree: {degree}")
    print(f"Error on Tuesday: {tuesday_error:.4f}")
    print(f"Error on Wednesday: {wednesday_error:.4f}")
