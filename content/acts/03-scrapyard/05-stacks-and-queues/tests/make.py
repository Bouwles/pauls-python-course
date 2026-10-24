from collections import deque as _deque


def desk(ctx, lorries=()):
    module = ctx.module()
    bridge = module.Weighbridge()
    for lorry in lorries:
        bridge.arrive(lorry)
    return bridge


def same(name, got, expected, message):
    if got != expected:
        raise CheckFailed(message, expected=expected, actual=got)


def the_example(ctx):
    bridge = desk(ctx, ["flatbed", "tipper", "council van"])
    same("first", bridge.weigh(1200), "flatbed", "The first lorry weighed is the first that arrived.")
    same("second", bridge.weigh(3400), "tipper", "Then the next in line.")
    same("undo", bridge.undo(), "tipper", "Undo takes back the latest weighing and names its lorry.")
    same("waiting", bridge.waiting(), ["tipper", "council van"], "The tipper goes back to the front of the queue.")
    same("total", bridge.total, 1200, "Only the flatbed's 1200 kg still counts.")


def fresh_desk(ctx):
    bridge = desk(ctx)
    same("waiting", bridge.waiting(), [], "A new desk has nobody waiting.")
    same("total", bridge.total, 0, "A new desk has weighed nothing.")


def weigh_nobody(ctx):
    bridge = desk(ctx)
    same("weigh", bridge.weigh(500), None, "With nobody waiting, weigh hands back None.")
    same("total", bridge.total, 0, "Weighing nobody adds nothing to the total.")
    same("undo", bridge.undo(), None, "A weighing of nobody isn't something undo can take back.")


def undo_nothing(ctx):
    bridge = desk(ctx, ["skip lorry"])
    same("undo", bridge.undo(), None, "Before any weighing, there's nothing to take back.")
    same("waiting", bridge.waiting(), ["skip lorry"], "An undo with nothing to take back leaves the queue alone.")
    same("total", bridge.total, 0, "An undo with nothing to take back leaves the total alone.")


def undo_newest_first(ctx):
    bridge = desk(ctx, ["a", "b", "c", "d"])
    bridge.weigh(100)
    bridge.weigh(200)
    bridge.weigh(300)
    same("first undo", bridge.undo(), "c", "The first undo takes back the latest weighing, c.")
    same("second undo", bridge.undo(), "b", "The second undo takes back the one before, b.")
    same("waiting", bridge.waiting(), ["b", "c", "d"], "b and c go back to the front, in the order they were in.")
    same("total", bridge.total, 100, "Only a's 100 kg still counts.")


def undo_everything(ctx):
    bridge = desk(ctx, ["van", "tipper"])
    bridge.weigh(900)
    bridge.weigh(2500)
    bridge.undo()
    bridge.undo()
    same("third undo", bridge.undo(), None, "After both weighings are taken back, there's nothing left to undo.")
    same("waiting", bridge.waiting(), ["van", "tipper"], "Both lorries are back, in their old order.")
    same("total", bridge.total, 0, "Nothing weighed still stands.")


def weigh_again(ctx):
    bridge = desk(ctx, ["flatbed", "tipper"])
    bridge.weigh(1200)
    bridge.undo()
    same("weigh again", bridge.weigh(1150), "flatbed", "After an undo, the same lorry is first to be weighed again.")
    same("total", bridge.total, 1150, "Only the new weighing counts.")
    same("undo again", bridge.undo(), "flatbed", "Undo now takes back the new weighing.")
    same("total after", bridge.total, 0, "With both weighings of the flatbed gone, the total is 0.")


def late_arrival(ctx):
    bridge = desk(ctx, ["a", "b"])
    bridge.weigh(400)
    bridge.arrive("c")
    bridge.undo()
    same("waiting", bridge.waiting(), ["a", "b", "c"], "a goes back to the front; c, who arrived later, stays at the back.")


def failed_weigh_not_undone(ctx):
    bridge = desk(ctx, ["van"])
    bridge.weigh(700)
    bridge.weigh(300)
    same("undo", bridge.undo(), "van", "The second weigh found nobody waiting, so undo takes back the van's weighing.")
    same("total", bridge.total, 0, "The van's 700 kg comes off.")


def list_is_a_copy(ctx):
    bridge = desk(ctx, ["a", "b"])
    shown = bridge.waiting()
    shown.append("intruder")
    shown.pop(0)
    same("waiting", bridge.waiting(), ["a", "b"], "Changing the list waiting() gave back shouldn't change the queue.")


def same_lorry_twice(ctx):
    bridge = desk(ctx, ["tipper", "van", "tipper"])
    same("first", bridge.weigh(3000), "tipper", "The tipper's first trip is at the front.")
    same("second", bridge.weigh(800), "van", "Then the van.")
    same("third", bridge.weigh(2800), "tipper", "Then the tipper again, back for a second load.")
    same("total", bridge.total, 6600, "Three weighings: 3000 + 800 + 2800.")


def queue_is_a_deque(ctx):
    bridge = desk(ctx, ["a"])
    if not any(isinstance(value, _deque) for value in vars(bridge).values()):
        raise CheckFailed("Keep the queue in a collections.deque, as one of the desk's attributes, so popleft is quick.")


def busy_saturday(ctx):
    bridge = desk(ctx)
    for number in range(100_000):
        bridge.arrive(f"lorry-{number}")
    for _ in range(100_000):
        bridge.weigh(10)
    same("total", bridge.total, 1_000_000, "A hundred thousand lorries at 10 kg each.")
    same("last undo", bridge.undo(), "lorry-99999", "The last lorry weighed is the first undo takes back.")


TESTS = [
    custom("The example from the brief", the_example, visible=True),
    output("The main block", visible=True,
           expect="Waiting: ['flatbed', 'tipper', 'council van']\nWeighed flatbed: 1200 kg\nWeighed tipper: 3400 kg\n"
                  "Undo: tipper goes back to the front\nWaiting: ['tipper', 'council van']\nTotal: 1200 kg"),
    custom("A new desk", fresh_desk, hint="In __init__, start with an empty queue and a total of 0."),
    custom("Weighing with nobody waiting", weigh_nobody,
           hint="If the queue is empty, return None before anything is changed or pushed onto the undo stack."),
    custom("Undo with nothing to undo", undo_nothing,
           hint="If the undo stack is empty, return None and change nothing."),
    custom("Undo twice, newest first", undo_newest_first,
           hint="Pop the undo stack from the top, and put each lorry back with appendleft, so the earlier one ends up in front."),
    custom("Undo the whole day", undo_everything),
    custom("Weighed again after an undo", weigh_again),
    custom("A lorry that arrives after a weighing", late_arrival,
           hint="Undo puts the lorry back at the front, not the back."),
    custom("A weighing of nobody isn't undone", failed_weigh_not_undone,
           hint="Only push onto the undo stack when a lorry was actually weighed."),
    custom("waiting() hands back a new list", list_is_a_copy,
           hint="Return list(self.queue), a new list, rather than the queue itself."),
    custom("The same lorry, two trips", same_lorry_twice),
    custom("The queue is a deque", queue_is_a_deque),
    custom("A hundred thousand lorries", busy_saturday, timeout=5,
           hint="popleft on a deque is quick however long the queue is."),
]
