def closing(fn):
    """Run a check, then close every figure it made."""
    def check(ctx):
        import matplotlib.pyplot as plt

        try:
            fn(ctx)
        finally:
            plt.close("all")
    return check


@closing
def decades_from_zero(ctx):
    fig, ax = ctx.module().decade_bars(["1920s", "1960s", "2010s"], [11.0, 11.1, 12.0])
    bottom = float(ax.get_ylim()[0])
    if bottom != 0:
        raise CheckFailed("The bars are drawn from the bottom of the scale, so their lengths only mean something if it starts at 0.",
                          expected=0.0, actual=bottom)
    heights = [round(b.get_height(), 3) for b in ax.patches]
    if heights != [11.0, 11.1, 12.0]:
        raise CheckFailed("Keep one bar per decade, as tall as its temperature.", expected="[11.0, 11.1, 12.0]", actual=str(heights))


@closing
def panels_share(ctx):
    driest = [101.6, 77.6, 65.2, 39.4, 35.9, 33.6, 61.6, 41.0, 91.7, 60.6, 92.9, 96.8]
    wettest = [160.2, 80.5, 58.2, 75.6, 57.3, 49.2, 104.2, 131.5, 148.3, 196.7, 201.9, 175.4]
    fig, axes = ctx.module().rain_panels(driest, wettest)
    left, right = axes[0], axes[1]
    if not left.get_shared_y_axes().joined(left, right):
        raise CheckFailed("The two panels each chose their own scale, so 1982's wettest month reaches as high as 1960's. Make them share one scale.")
    if float(left.get_ylim()[0]) != 0:
        raise CheckFailed("The rain bars should start at 0.", expected=0.0, actual=float(left.get_ylim()[0]))


@closing
def panels_kept(ctx):
    driest = [101.6, 77.6, 65.2, 39.4, 35.9, 33.6, 61.6, 41.0, 91.7, 60.6, 92.9, 96.8]
    wettest = [160.2, 80.5, 58.2, 75.6, 57.3, 49.2, 104.2, 131.5, 148.3, 196.7, 201.9, 175.4]
    fig, axes = ctx.module().rain_panels(driest, wettest)
    found = [[round(b.get_height(), 1) for b in ax.patches] for ax in axes]
    if found != [driest, wettest]:
        raise CheckFailed("Keep the driest year on the left and the wettest on the right, twelve bars each.")


TESTS = [
    custom("The decade bars start at zero", decades_from_zero, visible=True),
    custom("The two panels share a scale", panels_share, visible=True),
    custom("Both panels still show their months", panels_kept),
]
