"""The merchant's round, chalked crate to crate."""


class Crate:
    """One crate on the round: its part, and the crate after it."""

    def __init__(self, part):
        self.part = part
        self.next = None


class Round:
    """The merchant's round, as a chain of crates starting at head."""

    def __init__(self):
        self.head = None

    def append(self, part):
        crate = Crate(part)
        if self.head is None:
            self.head = crate
            return
        last = self.head
        while last.next is not None:
            last = last.next
        last.next = crate

    def parts(self):
        found = []
        crate = self.head
        while crate is not None:
            found.append(crate.part)
            crate = crate.next
        return found

    def __len__(self):
        count = 0
        crate = self.head
        while crate is not None:
            count = count + 1
            crate = crate.next
        return count

    def insert_after(self, existing, part):
        crate = self.head
        while crate is not None and crate.part != existing:
            crate = crate.next
        if crate is None:
            raise ValueError(f"no {existing} on the round")
        new = Crate(part)
        new.next = crate.next
        crate.next = new

    def remove(self, part):
        if self.head is None:
            raise ValueError(f"no {part} on the round")
        if self.head.part == part:
            self.head = self.head.next
            return
        before = self.head
        while before.next is not None and before.next.part != part:
            before = before.next
        if before.next is None:
            raise ValueError(f"no {part} on the round")
        before.next = before.next.next

    def reverse(self):
        before = None
        crate = self.head
        while crate is not None:
            after = crate.next
            crate.next = before
            before = crate
            crate = after
        self.head = before


if __name__ == "__main__":
    merchant = Round()
    for part in ["anchor", "bell", "chain", "drum"]:
        merchant.append(part)
    print("Round:", merchant.parts())
    merchant.insert_after("bell", "gong")
    print("After the bell, a gong:", merchant.parts())
    merchant.remove("anchor")
    print("The merchant took the anchor:", merchant.parts())
    merchant.reverse()
    print("From the far gate:", merchant.parts())
    print(len(merchant), "crates")
