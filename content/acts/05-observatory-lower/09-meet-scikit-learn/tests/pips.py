def scaled_inside(ctx):
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    mod = ctx.module()
    model = getattr(mod, "model", None)
    if model is None:
        raise CheckFailed("Keep the name model for the thing cross_val_score is given.")
    if not isinstance(model, Pipeline):
        raise CheckFailed("model should be a pipeline, so the scaling travels with the k-NN into every fold.", actual=repr(model))
    steps = [step for _, step in model.steps]
    if not (isinstance(steps[0], StandardScaler) and isinstance(steps[-1], KNeighborsClassifier)):
        raise CheckFailed("The pipeline should scale first, then ask the neighbours.", expected="StandardScaler, then KNeighborsClassifier", actual=repr(model))


SCALE_HINT = ("If you scaled X before calling cross_val_score, the scaler measured every evening, test folds included. "
              "Put the StandardScaler inside the pipeline instead, so each fold is scaled with its own training part.")

TESTS = [
    output("Fifteen neighbours, scaled", expect="k-NN, 15 neighbours: 0.884", match="contains", visible=True, hint=SCALE_HINT),
    output("Twenty-five neighbours, scaled", set_vars={"NEIGHBOURS": 25}, expect="k-NN, 25 neighbours: 0.875",
           match="contains", visible=True, hint=SCALE_HINT),
    custom("The scaler is inside the pipeline", scaled_inside),
    output("One neighbour, scaled", set_vars={"NEIGHBOURS": 1}, expect="k-NN, 1 neighbours: 0.878", match="contains", hint=SCALE_HINT),
    output("The baseline hasn't moved", expect="Always saying no: 0.659", match="contains"),
]
