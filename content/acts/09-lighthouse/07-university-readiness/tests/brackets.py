def deep_and_balanced(ctx):
    module = ctx.module()
    text = "(" * 25_000 + "[{}]" * 10_000 + ")" * 25_000
    got = module.first_error(text)
    if got != -1:
        raise CheckFailed("25,000 brackets deep, every one closed: that's balanced.", expected=-1, actual=got)


def deep_and_unclosed(ctx):
    module = ctx.module()
    text = "{" + "(" * 30_000 + ")" * 30_000
    got = module.first_error(text)
    if got != 0:
        raise CheckFailed("A { at position 0, then 60,000 brackets that pair up. The { is never closed.", expected=0, actual=got)


def deep_and_wrong(ctx):
    module = ctx.module()
    text = "[" * 40_000 + ")" + "]" * 40_000
    got = module.first_error(text)
    if got != 40_000:
        raise CheckFailed("40,000 [ brackets, then a ) at position 40,000.", expected=40_000, actual=got)


TESTS = [
    function("A closer of the wrong kind", call="first_error", args=("[lamp(on]",), expect=8, visible=True),
    function("An opener never closed", call="first_error", args=("(dusk (dawn)",), expect=0, visible=True),
    function("Balanced and nested", call="first_error", args=("{dusk: [lamp(on)]}",), expect=-1),
    function("Empty text", call="first_error", args=("",), expect=-1,
             hint="No brackets at all means no problems: -1."),
    function("No brackets, only words", call="first_error", args=("lamp on at dusk",), expect=-1),
    function("A lone closer", call="first_error", args=(")",), expect=0,
             hint="A closer with nothing open has no partner. Check the stack is empty before you look at its top."),
    function("A closer before any opener", call="first_error", args=("dusk)(",), expect=4),
    function("Two kinds that don't pair", call="first_error", args=("(]",), expect=1),
    function("Right counts, wrong nesting", call="first_error", args=("([)]",), expect=2,
             hint="Counting each kind isn't enough: the ) arrives while [ is the innermost open bracket."),
    function("A closer too many", call="first_error", args=("(lamp))(",), expect=6),
    function("Several still open", call="first_error", args=("a(b[c{d}",), expect=1,
             hint="When the text runs out, the answer is the earliest bracket still open: the bottom of the stack, not the top."),
    function("Open, close, then one left open", call="first_error", args=("()[",), expect=2),
    function("A bad closer before the end", call="first_error", args=("((]",), expect=2,
             hint="Read left to right and stop at the first closer that doesn't match, even if openers are still waiting."),
    function("Every kind, balanced", call="first_error", args=("{[()()]}[]({})",), expect=-1),
    function("A single opener", call="first_error", args=("{",), expect=0),
    custom("Balanced, 25,000 deep", deep_and_balanced),
    custom("Never closed, 60,000 long", deep_and_unclosed,
           hint="A long text with the problem at the very start. Keep positions on the stack, not just brackets."),
    custom("Wrong closer, 40,000 deep", deep_and_wrong),
]
