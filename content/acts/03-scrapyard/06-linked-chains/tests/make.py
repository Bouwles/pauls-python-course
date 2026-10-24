def build(ctx, parts):
    module = ctx.module()
    merchant = module.Round()
    for part in parts:
        merchant.append(part)
    return module, merchant


def walk(merchant, limit=10_000):
    """The crates themselves, following next from head. Stops a loop that never ends."""
    crates = []
    crate = merchant.head
    while crate is not None:
        crates.append(crate)
        if len(crates) > limit:
            raise CheckFailed("Following next from head never reaches None: some crate points back along the round.")
        crate = crate.next
    return crates


def linked_parts(merchant):
    return [crate.part for crate in walk(merchant)]


def expect_chain(merchant, expected, message):
    got = linked_parts(merchant)
    if got != expected:
        raise CheckFailed(message + " (following next from head)", expected=expected, actual=got)
    shown = merchant.parts()
    if shown != expected:
        raise CheckFailed(message + " (from parts())", expected=expected, actual=shown)
    if len(merchant) != len(expected):
        raise CheckFailed(message + " (from len())", expected=len(expected), actual=len(merchant))


def the_example(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain", "drum"])
    expect_chain(merchant, ["anchor", "bell", "chain", "drum"], "Four crates, in the order they were appended.")
    merchant.insert_after("bell", "gong")
    expect_chain(merchant, ["anchor", "bell", "gong", "chain", "drum"], "The gong goes straight after the bell.")
    merchant.remove("anchor")
    expect_chain(merchant, ["bell", "gong", "chain", "drum"], "Taking the anchor off the front.")
    merchant.reverse()
    expect_chain(merchant, ["drum", "chain", "gong", "bell"], "The round, from the far gate.")


def empty_round(ctx):
    _, merchant = build(ctx, [])
    if merchant.head is not None:
        raise CheckFailed("A new round has no crates, so its head is None.", expected=None, actual=merchant.head)
    expect_chain(merchant, [], "An empty round.")


def really_linked(ctx):
    module, merchant = build(ctx, ["anchor", "bell", "chain"])
    crates = walk(merchant)
    if not all(isinstance(crate, module.Crate) for crate in crates):
        raise CheckFailed("Every crate on the round should be a Crate, linked to the next by its next attribute.")
    if crates[-1].next is not None:
        raise CheckFailed("The last crate's next should be None.")
    for name, value in vars(merchant).items():
        if isinstance(value, (list, tuple, dict)):
            raise CheckFailed(f"The round keeps a {type(value).__name__} called {name}. Keep the crates linked to each other instead.")


def one_crate(ctx):
    _, merchant = build(ctx, ["anvil"])
    expect_chain(merchant, ["anvil"], "One crate.")
    if merchant.head.next is not None:
        raise CheckFailed("A one-crate round's only crate points at None.")


def insert_at_end(ctx):
    _, merchant = build(ctx, ["anchor", "bell"])
    merchant.insert_after("bell", "chain")
    expect_chain(merchant, ["anchor", "bell", "chain"], "A crate put in after the last one becomes the last.")
    merchant.append("drum")
    expect_chain(merchant, ["anchor", "bell", "chain", "drum"], "Appending after that still goes on the end.")


def insert_first_match(ctx):
    _, merchant = build(ctx, ["bell", "anchor", "bell"])
    merchant.insert_after("bell", "gong")
    expect_chain(merchant, ["bell", "gong", "anchor", "bell"], "With two bells, the gong goes after the first.")


def insert_into_one(ctx):
    _, merchant = build(ctx, ["anvil"])
    merchant.insert_after("anvil", "bucket")
    expect_chain(merchant, ["anvil", "bucket"], "A crate after the only crate.")


def insert_missing(ctx):
    _, merchant = build(ctx, ["anchor", "bell"])
    try:
        merchant.insert_after("kettle", "gong")
    except ValueError:
        expect_chain(merchant, ["anchor", "bell"], "A failed insert should leave the round as it was.")
        return
    raise CheckFailed("There's no kettle on the round, so insert_after should raise ValueError.")


def insert_into_empty(ctx):
    _, merchant = build(ctx, [])
    try:
        merchant.insert_after("anchor", "gong")
    except ValueError:
        expect_chain(merchant, [], "A failed insert leaves the empty round empty.")
        return
    raise CheckFailed("An empty round has no anchor, so insert_after should raise ValueError.")


def remove_middle(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain"])
    merchant.remove("bell")
    expect_chain(merchant, ["anchor", "chain"], "Taking the bell out of the middle.")


def remove_last(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain"])
    merchant.remove("chain")
    expect_chain(merchant, ["anchor", "bell"], "Taking the last crate off.")
    merchant.append("drum")
    expect_chain(merchant, ["anchor", "bell", "drum"], "After taking the last crate off, appending still goes on the end.")


def remove_only(ctx):
    _, merchant = build(ctx, ["anvil"])
    merchant.remove("anvil")
    expect_chain(merchant, [], "Taking off the only crate leaves an empty round.")
    if merchant.head is not None:
        raise CheckFailed("An empty round's head is None.")
    merchant.append("bucket")
    expect_chain(merchant, ["bucket"], "An emptied round can start again.")


def remove_first_match(ctx):
    _, merchant = build(ctx, ["bell", "anchor", "bell"])
    merchant.remove("bell")
    expect_chain(merchant, ["anchor", "bell"], "With two bells, only the first comes off.")


def remove_missing(ctx):
    _, merchant = build(ctx, ["anchor", "bell"])
    try:
        merchant.remove("kettle")
    except ValueError:
        expect_chain(merchant, ["anchor", "bell"], "A failed remove should leave the round as it was.")
        return
    raise CheckFailed("There's no kettle on the round, so remove should raise ValueError.")


def remove_from_empty(ctx):
    _, merchant = build(ctx, [])
    try:
        merchant.remove("anchor")
    except ValueError:
        return
    except AttributeError:
        raise CheckFailed("Removing from an empty round crashed with AttributeError. Check for an empty round, and raise ValueError.")
    raise CheckFailed("An empty round has no anchor, so remove should raise ValueError.")


def reverse_same_crates(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain", "drum", "engine"])
    before = walk(merchant)
    merchant.reverse()
    after = walk(merchant)
    if [crate.part for crate in after] != ["engine", "drum", "chain", "bell", "anchor"]:
        raise CheckFailed("Reversed, the round runs from the engine back to the anchor.",
                          expected=["engine", "drum", "chain", "bell", "anchor"], actual=[crate.part for crate in after])
    if [id(crate) for crate in after] != [id(crate) for crate in reversed(before)]:
        raise CheckFailed("reverse should turn the arrows round on the crates already there, not make new crates.")
    if before[0].next is not None:
        raise CheckFailed("After reversing, the old first crate is the last, so its next is None.")


def reverse_small(ctx):
    _, merchant = build(ctx, [])
    merchant.reverse()
    expect_chain(merchant, [], "Reversing an empty round leaves it empty.")
    merchant.append("anvil")
    merchant.reverse()
    expect_chain(merchant, ["anvil"], "Reversing one crate leaves it as it was.")
    merchant.append("bucket")
    merchant.reverse()
    expect_chain(merchant, ["bucket", "anvil"], "Reversing two crates swaps them.")


def reverse_twice(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain"])
    merchant.reverse()
    merchant.reverse()
    expect_chain(merchant, ["anchor", "bell", "chain"], "Reversing twice puts the round back as it was.")


def reverse_then_change(ctx):
    _, merchant = build(ctx, ["anchor", "bell", "chain"])
    merchant.reverse()
    merchant.append("drum")
    expect_chain(merchant, ["chain", "bell", "anchor", "drum"], "After reversing, a new crate still goes on the end.")
    merchant.remove("chain")
    merchant.insert_after("anchor", "gong")
    expect_chain(merchant, ["bell", "anchor", "gong", "drum"], "After reversing, removing and inserting still work.")


def long_round(ctx):
    _, merchant = build(ctx, [f"part-{number}" for number in range(600)])
    merchant.reverse()
    got = linked_parts(merchant)
    if got != [f"part-{number}" for number in range(599, -1, -1)] or len(merchant) != 600:
        raise CheckFailed("Six hundred crates, reversed: part-599 first, part-0 last.")


def parts_is_a_copy(ctx):
    _, merchant = build(ctx, ["anchor", "bell"])
    shown = merchant.parts()
    shown.append("intruder")
    expect_chain(merchant, ["anchor", "bell"], "Changing the list parts() gave back shouldn't change the round.")


TESTS = [
    custom("The example from the brief", the_example, visible=True),
    output("The main block", visible=True,
           expect="Round: ['anchor', 'bell', 'chain', 'drum']\nAfter the bell, a gong: ['anchor', 'bell', 'gong', 'chain', 'drum']\n"
                  "The merchant took the anchor: ['bell', 'gong', 'chain', 'drum']\nFrom the far gate: ['drum', 'chain', 'gong', 'bell']\n4 crates"),
    custom("An empty round", empty_round, hint="A new Round's head is None, its parts() is [], and its len() is 0."),
    custom("The crates point at each other", really_linked,
           hint="Each Crate keeps its part and a next. The Round keeps only head, the first crate."),
    custom("One crate", one_crate),
    custom("After the last crate", insert_at_end),
    custom("After the first of two bells", insert_first_match, hint="Stop at the first crate holding existing."),
    custom("After the only crate", insert_into_one),
    custom("After a crate that isn't there", insert_missing,
           hint="If the walk reaches None without finding existing, raise ValueError before changing anything."),
    custom("Into an empty round", insert_into_empty),
    custom("From the middle", remove_middle),
    custom("The last crate", remove_last,
           hint="Point the crate before the last at None. If you keep a note of the last crate, update it too."),
    custom("The only crate", remove_only,
           hint="Taking off the first crate means head moves on to head.next, which may be None."),
    custom("The first of two bells", remove_first_match),
    custom("A crate that isn't there", remove_missing),
    custom("From an empty round", remove_from_empty,
           hint="An empty round has a head of None. Check for that before reading head.part."),
    custom("Reversed, with the same crates", reverse_same_crates,
           hint="Turn each crate's next to point at the crate before it. Don't make new crates or a list."),
    custom("Reversing none, one and two crates", reverse_small,
           hint="At the end of the walk, head becomes the last crate you turned round."),
    custom("Reversed twice", reverse_twice),
    custom("Changed after reversing", reverse_then_change,
           hint="If you keep a note of the last crate, reverse changes which crate that is."),
    custom("Six hundred crates", long_round),
    custom("parts() hands back a new list", parts_is_a_copy),
]
