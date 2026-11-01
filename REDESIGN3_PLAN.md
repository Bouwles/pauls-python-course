# REDESIGN 3 PLAN: pixel everything

The owner's call after Redesign 2: the clean UI looks too generic, and the pixel cast reference (`art/pixel-reference/`) is the look he wants. So the whole product goes pixel, built on that cast: the characters are animated pixel people who talk and gesture, and the interface (headings, buttons, panels, tabs, icons) is pixel-styled. Body text and the code editor stay crisp for reading. Everything else from Redesign 2 stands: the name, the cast, the Clocktower, the learning screen's structure, the content.

Lessons kept from the first pixel look: one pixel font used with care (not for body text), one panel style (no frames inside frames), readable sizes, good contrast in both themes.

## P1: Pixel people (the engine)

- [x] `lib/pixel/people.ts`: draws a person from a look (face shape, skin, hair style and colour, brows, eyes, glasses, facial hair, top, accessory) on a 48x52 grid, the cast's reference style
- [x] The six cast looks, as the owner picked them; learner avatars from `lib/avatar.ts` drawn the same way, every option included
- [x] Ten expressions (neutral, talking, pleased, proud, thinking, confused, worried, surprised, laughing, unimpressed), a blink, and poses with arms (idle, wave, cheer, think, point, thumbs up)
- [x] `<PixelPerson>`: crisp canvas at whole-number scales, idle blink and breathing, a talking mouth while a line is said, gestures; still with reduced motion
- [x] Portraits, figures and avatars everywhere use it; the colour-and-initial placeholders go

## P2: Pixel interface

- [x] A pixel display font for headings, buttons, labels and nav; body text and code unchanged
- [x] Pixel buttons, panels, tabs, badges, inputs, bubbles, toasts and menus: square corners, stepped pixel borders, hard shadows, a real press
- [x] A pixel icon set
- [x] Style lint rewritten for the pixel rules

## P3: Pixel world and pages

- [x] The Clocktower and its nine rooms in pixel art, three states each, with the residents at work in busy rooms
- [x] Ask and Ship as pixel scenes: the client's room, the client animated (arrives, talks, celebrates)
- [x] Shelf objects as pixel art
- [x] The coach animated: talks while its line appears, reacts with a gesture
- [x] Every page restyled and checked at 1440x900 and 390x844, dark and light
- [x] The landing page's "Meet the class" with the animated cast

## Acceptance

- [x] Tests, axe, copy and style lint, brand check, Lighthouse; after screenshots of the 20 screens (tests/screenshots/redesign-3/after)
