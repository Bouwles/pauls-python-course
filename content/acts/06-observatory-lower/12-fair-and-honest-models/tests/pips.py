INSIDE = ("The choosing has to happen inside each fold, on that fold's training nights only. "
          "Put SelectKBest and the model in one pipeline, and cross-validate that on all the readings.")


def chooses_inside(ctx):
    from sklearn.feature_selection import SelectKBest
    from sklearn.pipeline import Pipeline

    mod = ctx.module()
    pipelines = [value for value in vars(mod).values() if isinstance(value, Pipeline)]
    if not any(isinstance(step, SelectKBest) for pipe in pipelines for _, step in pipe.steps):
        raise CheckFailed("The dial chooser should be a step in a pipeline, so cross_val_score refits it in every fold.")


TESTS = [
    output("Ten dials, chosen honestly", expect="The 10 best dials, cross-validated: 0.59", match="contains", visible=True, hint=INSIDE),
    output("Twenty dials, chosen honestly", set_vars={"DIALS": 20}, expect="The 20 best dials, cross-validated: 0.54",
           match="contains", visible=True, hint=INSIDE),
    custom("The chooser is inside the pipeline", chooses_inside),
    output("Five dials", set_vars={"DIALS": 5}, expect="The 5 best dials, cross-validated: 0.45", match="contains", hint=INSIDE),
    output("Three dials", set_vars={"DIALS": 3}, expect="The 3 best dials, cross-validated: 0.50", match="contains", hint=INSIDE),
    output("The baseline hasn't moved", expect="Always saying no: 0.57", match="contains"),
]
