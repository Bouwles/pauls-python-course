# REDESIGN 2 PLAN

The working plan for `REDESIGN-2.md`: the name goes back to Paul's Python Course, the pixel UI is replaced by a modern design system, the learning screen is rebuilt, the town map becomes the Clocktower, and a new cast of six people replaces the townsfolk. Ticked items are built and checked on screenshots or by tests. Non-obvious choices go in `DECISIONS.md`.

Screenshots: the same 20 screens as the first redesign's after set, at 1440x900 and 390x844, night and day. Before: `tests/screenshots/redesign-2/before/`. After: `tests/screenshots/redesign-2/after/`.

---

## Phase S1: Brand back (Section 1)

- [ ] `lib/brand.ts`: Paul's Python Course, PPC, the new tagline and description; `townName` removed
- [ ] Every mention of Fixwick and the old cast removed from UI, content, emails, metadata and sprites
- [ ] Build check fails on "Fixwick", "Saltmarsh", "Penhallow" and the old character names in UI and dialogue strings, but never on `pip` the installer
- [ ] Footer: "Fixwick is made up" removed; the credit line and pixel heart kept in the footer and Settings
- [ ] Wordmark in the display font with an SVG snake curled into a P; favicons at 16, 32, 180 and 512 px from the mark; OG image

## Phase S2: New design system (Sections 2 and 3)

- [ ] Tokens rebuilt: dark (default) and light themes, sun and blue accents, status colours, character colours; the night and day palettes deleted
- [ ] Bricolage Grotesque (display), Atkinson Hyperlegible Next (text and UI), JetBrains Mono (code); the pixel font removed
- [ ] Radius 8, 6, 4; one floating shadow; borders only where similar surfaces meet; no 9-slice frames or `border-image`
- [ ] Phosphor icons (regular, 20 px) replace the pixel icon set
- [ ] Components: buttons (primary, secondary, ghost, run, danger; pressed, focus, locked, disabled), tabs with counts, cards, inputs, badges, toasts, speech bubble, editor themes, error panel
- [ ] Motion 150 to 200 ms ease-out, off with reduced motion
- [ ] Style lint updated to the new rules

## Phase S3: The learning screen (Section 4)

- [ ] Header with the breadcrumb "Act 1 / Bill Splitter" and "Project 2 of 13"; named step bar with done, current and future states, collapsing done steps
- [ ] Instructions panel (400 px, resizable 340 to 520, collapsible): step title, what to do, the coach, Hint and the duck, collapsed spec and visible checks, Predict options as cards
- [ ] The coach: 64 px portrait, name tag, speech bubble, history on click, "Less talk" setting; the bottom dialogue bar deleted
- [ ] Editor takes the rest; Run and Check top right; Reset, History and Keys in the menu
- [ ] Console collapsed to a 40 px bar until the first Run or Check, then 35 per cent, resizable and remembered
- [ ] Check results with a pass/fail progress bar and the first failure expanded, differences highlighted character by character; "Next step" when all pass
- [ ] Ask and Ship panels with the large illustration slot, speech bubbles, the demo frame, the stamp, Shelf and Download
- [ ] Phone: header, scrolling step bar, three tabs, a pinned 56 px Run and Check bar

## Phase S4: The Clocktower (Section 5)

- [ ] Cross-section of nine floors, each a swappable art layer in three states (locked, open, busy); placeholder floors in their character's colour with a room icon
- [ ] Hover labels, a side sheet of project cards, Pro floors listed with "Get Pro"
- [ ] Continue, Morning Rounds and Shelf cards; "The Clocktower" title with one line of progress
- [ ] List view

## Phase S5: The other pages (Section 6)

- [ ] Landing: hero with the live Workbench in a browser frame, "Try it now", an asymmetric grid of real project outputs, "Meet the class", the Clocktower, pricing, FAQ, footer
- [ ] Syllabus, Pricing, Handbook pages, Morning Rounds, Drills (topic grid), Shelf (output previews), Settings, paywall gate, Arcade League, sign up and log in, legal pages, teacher pages, certificates and share pages

## Phase S6: The cast (Sections 7 and 8)

- [ ] Six characters (Paul, Neil, Aaesha, Caitlin, Riya, Yahya) with colours, roles and voices; the old cast files deleted
- [ ] Every project's client, dialogue and story context moved to the new cast, Act by Act, with names, concepts, steps and tests kept and every check passing
- [ ] At least 60 reactive lines for Act I in the new voices
- [ ] The "fix my version" step rotates between the four classmates and is always friendly
- [ ] Concepts, Handbook pages and placement tests rewritten for the new cast; the Penhallow story notes removed
- [ ] Human avatar creation (initials placeholder until the art arrives), shown in the header, on the Shelf and on public pages
- [ ] `art/ARTIST_BRIEF.md`, `art/CAST_APPEARANCE.md`, `art/manifest.json`, `art/README.md`, the `<Art>` component, `/dev/art` and `scripts/check-art.ts`
- [ ] Placeholders: colour-and-initial portraits, Phosphor icons for Shelf objects
- [ ] All pixel sprites, scenes and frames removed except the heart; the sprite pipeline removed if nothing uses it

## Acceptance (Section 10)

- [ ] Every Brand, Design system, Learning screen, Clocktower, Cast and art, and Everything else item, checked on screenshots and tests
- [ ] Before and after screenshots

---

## How the work is split

The shared base is done first in one place: the brand, the cast files and content schema, the tokens, fonts, icons and base components. Then the work runs in parallel, each part in its own folders:

- Content, by Act: I; II and III; IV and V; VI and VII; VIII and IX; and the shared concepts, Handbook and placement files.
- Interface: the learning screen; the Clocktower; the public pages; the signed-in pages; the art pipeline and its documents.
