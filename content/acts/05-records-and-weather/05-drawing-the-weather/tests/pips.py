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
    fig, ax = ctx.module().decade_bars(["1920s", "1960s", "2010s"], [7.91, 8.0, 8.85])
    bottom = float(ax.get_ylim()[0])
    if bottom != 0:
        raise CheckFailed("The bars are drawn from the bottom of the scale, so their lengths only mean something if it starts at 0.",
                          expected=0.0, actual=bottom)
    heights = [round(b.get_height(), 3) for b in ax.patches]
    if heights != [7.91, 8.0, 8.85]:
        raise CheckFailed("Keep one bar per decade, as tall as its temperature.", expected="[7.91, 8.0, 8.85]", actual=str(heights))


@closing
def panels_share(ctx):
    driest = [118.7, 58.2, 100.7, 36.7, 42.1, 65.8, 43.0, 30.7, 34.1, 159.1, 38.2, 72.7]
    wettest = [206.3, 129.4, 153.7, 107.4, 103.8, 104.6, 70.5, 54.5, 118.7, 132.3, 151.8, 214.0]
    fig, axes = ctx.module().rain_panels(driest, wettest)
    left, right = axes[0], axes[1]
    if not left.get_shared_y_axes().joined(left, right):
        raise CheckFailed("The two panels each chose their own scale, so 1968's wettest month reaches as high as 1999's. Make them share one scale.")
    if float(left.get_ylim()[0]) != 0:
        raise CheckFailed("The rain bars should start at 0.", expected=0.0, actual=float(left.get_ylim()[0]))


@closing
def panels_kept(ctx):
    driest = [118.7, 58.2, 100.7, 36.7, 42.1, 65.8, 43.0, 30.7, 34.1, 159.1, 38.2, 72.7]
    wettest = [206.3, 129.4, 153.7, 107.4, 103.8, 104.6, 70.5, 54.5, 118.7, 132.3, 151.8, 214.0]
    fig, axes = ctx.module().rain_panels(driest, wettest)
    found = [[round(b.get_height(), 1) for b in ax.patches] for ax in axes]
    if found != [driest, wettest]:
        raise CheckFailed("Keep the driest year on the left and the wettest on the right, twelve bars each.")


TESTS = [
    custom("The decade bars start at zero", decades_from_zero, visible=True),
    custom("The two panels share a scale", panels_share, visible=True),
    custom("Both panels still show their months", panels_kept),
]
