---
id: learn-reverse
type: learn
title: Turning the round round
concept: linked-lists
code: |
  class Crate:
      def __init__(self, part):
          self.part = part
          self.next = None


  def show(crate):
      parts = []
      while crate is not None:
          parts.append(crate.part)
          crate = crate.next
      print(parts)


  axle = Crate("axle")
  axle.next = Crate("brakes")
  axle.next.next = Crate("chassis")

  before = None
  crate = axle
  while crate is not None:
      after = crate.next
      crate.next = before
      before = crate
      crate = after
  show(before)
---
To reverse a linked list in place, walk it once and turn each arrow round to point at the crate before. No crate moves and none is made.

```text
before:  axle -> brakes -> chassis -> None
after:   None <- axle <- brakes <- chassis
```

Keep three names as you walk: `before`, the crate just turned; `crate`, the one you're on; `after`, the next. Save `after` first, because turning this crate's arrow forgets it. Then point `crate.next` at `before`, and step both names along. When `crate` is `None`, `before` is the new first crate. The example prints `['chassis', 'brakes', 'axle']`.

The usual slip is to turn the arrow before saving `after`. Then the walk has nowhere to go.
