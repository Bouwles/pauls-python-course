# REDESIGN.md: rebrand, new look, real projects, better characters, paid plans

Read this whole file before changing anything. It is a revision brief for the app you have already built from the original prompt (`pauls-python-course-prompt.md`). The owner has used the current build and the verdict is blunt: **it looks extremely AI generated.** Fixing that is the top priority. This file also renames the product, rewrites the curriculum around real projects, raises the character art and writing to a much higher standard, and adds paid subscriptions.

## How this file relates to the original prompt

- **This file overrides** these sections of the original prompt: 1 (what this is), 4 (the world), 5 (curriculum), 6 (characters), 7 (art direction, typography, palette), 8.1 (landing page), 8.4 (Workbench layout), 16 to 19 (motivation, microcopy, landing copy, owner decisions), and every place where colours, fonts or the name "Paul's Python Course" are hard-coded.
- **These still stand unchanged:** the teaching method (Section 3), the step types and hint rules, the Python runtime (Section 10), checking work (Section 11), the architecture (Section 12), saving and accounts (Section 13), content format (Section 14), accessibility (15), legal (20), testing (21). Keep everything that already works: auth, autosave, Pyodide, `input()`, Stop, tests, snapshots.
- If this file and the original disagree, this file wins.

## Order of work

1. Read this file. Write a short `REDESIGN_PLAN.md` listing what you will change, in the order below. Keep it updated.
2. **Phase R1: Visual reset.** New tokens, fonts, palette, components, Workbench layout, landing page, map. (Sections 2 to 5.)
3. **Phase R2: Rebrand.** Name, copy, footer credit, metadata. (Section 1.)
4. **Phase R3: Characters.** New character specs, redrawn sprites, portraits, dialogue system. (Section 6.)
5. **Phase R4: Curriculum.** New Act and project structure with real projects. Rewrite the existing Act I content to match. (Section 7.)
6. **Phase R5: Paid plans.** Entitlements, payments, paywall, pricing page, billing settings. (Section 8.)
7. **Phase R6: Growth basics.** Public SEO pages, sharing, analytics funnel. (Section 9.)
8. Run the full acceptance checklist (Section 11) and screenshot every screen.

Do not start R4 or R5 until R1 has passed its acceptance checks. The look is what the owner noticed first.

---

## 1. The rebrand

### 1.1 New name

The product is renamed **Fixwick**.

- Fixwick is also the name of the town. The product, the town and the game share one name, like Stardew Valley.
- Tagline: **"Learn Python by fixing a town."**
- Longer description, for metadata and the landing page: "Fixwick is a Python course built as a game. Townsfolk bring you real programs to build, from a bill splitter to a spam filter to a game-playing AI. You write real code in your browser, and everything you build is yours to keep."
- The old town name "Saltmarsh" is removed everywhere. It is too close to an existing Dungeons and Dragons product, and that matters now the product is commercial.
- The phrase "Paul's Python Course" is removed from all UI, metadata, emails and page titles.

### 1.2 Make the name swappable

The owner may still change the name before buying a domain. Put every brand string in one file, `lib/brand.ts`:

```ts
export const BRAND = {
  name: "Fixwick",
  townName: "Fixwick",
  tagline: "Learn Python by fixing a town.",
  description: "...",
  domain: "fixwick.example",   // owner will replace
  supportEmail: "hello@fixwick.example",
  creditName: "Paul Nercessian",
};
```

No component, page, email template, OG image or content file may hard-code the name. Content files use a `{{town}}` token that the content compiler replaces. Write a test that greps the built output for "Saltmarsh" and "Paul's Python Course" and fails if either appears.

### 1.3 The credit line

The owner wants a small "made with love" credit.

- Text: **"Made with [heart] by Paul Nercessian"**, where [heart] is a small red **pixel-art heart sprite** (8x7 pixels, drawn in the palette, scaled 2x), not the emoji character. The emoji renders differently on every device and clashes with the pixel art. The sprite gets `alt="love"` so screen readers read "Made with love by Paul Nercessian".
- It appears in exactly two places: the site footer (small, muted, right-aligned on desktop, centred on phone) and the bottom of the Settings page.
- Optional touch: hovering or tapping the heart makes it do a two-frame beat once. Respect reduced motion.
- The name links to nothing by default. Add `BRAND.creditUrl` for later.

### 1.4 Logo and wordmark

- Wordmark: "Fixwick" set in the pixel display font (Section 3.2), drawn as a crisp sprite at integer scale. Do not use a tilted, gradient or glowing logo.
- Mark: a small 16x16 pixel icon, a spanner crossed with a fish-shaped weathervane (the town's weathervane, which appears on the map). Use it as the favicon (export 16, 32, 180 and 512 px PNGs, all nearest-neighbour scaled).
- OG image (1200x630): the pixel town at dusk with the wordmark. Rendered from the sprite pipeline, not designed separately.

---

## 2. Why the current build looks AI generated

Read this section carefully. Then open the current Workbench, landing page and map, and see every one of these problems for yourself before you fix them.

### 2.1 Diagnosis

The current build has the house style of an AI company's own product. Warm cream "paper" background, a book serif for body text, one burnt-amber accent, hairline grey rules, and small tracked uppercase labels. This is almost exactly the look of Claude.ai and Anthropic's own website. That is why it reads as generated: it copies the visual identity most associated with AI. The original prompt asked for it by accident ("off-white paper, black ink, one amber accent, book serif"). That direction is cancelled completely.

Specific problems seen in the current Workbench screenshot:

1. **Cream background (`#F4F1EA`-like) everywhere.** Remove it.
2. **Serif body text** (Source Serif or Literata style) in the lesson panel and the error explanation. Remove all serif fonts from the product.
3. **Amber accent button (`#C8811E`-like) with a keyboard hint inside it.** Remove it.
4. **Small tracked uppercase eyebrow labels:** "JOB 3", "PIP'S VERSION", "MOSS'S HINTS", "CHECKS YOU CAN SEE". This is one of the strongest AI tells. Remove every one. Never use `text-transform: uppercase` with letter-spacing on labels.
5. **Duplicated heading:** "PIP'S VERSION" eyebrow, then "Pip's Version" heading right under it. A label should never repeat the heading.
6. **Hairline 1px grey borders boxing every panel.** The whole screen is boxes inside boxes. Remove them.
7. **Grey text-only "links" used as buttons:** "Reset", "History", "Keys", "Back", "Explain it to Dennis", "Go to line 4", "Saved on this device", "Keep your work". Actions must look like things you can press.
8. **The hand-drawn wavy underline** under the current step. It is a known "trying to look handmade" tell. Remove it.
9. **"About 30 minutes."** as a grey subtitle under the title. Generic metadata styling. Move it into the job ticket (Section 5) or drop it.
10. **The three-column documentation layout** (steps on the left, editor in the middle, sidebar on the right). It looks like a docs site, not a game, and it squeezes the editor. Replace it (Section 5).
11. **The cluttered scene in the top right.** The room is crammed with tiny objects at the same scale as the characters. The characters are tiny, hard to read, and don't look like who they are meant to be (Moss doesn't read as a tortoise). The portrait below it is a crop of the same muddy scene. Replace it with proper dialogue portraits (Section 6).
12. **The pixel font name label "MOSS" set in amber next to a serif paragraph.** Mixed metaphors. The game layer and the tool layer don't belong to the same product.
13. **Pale pink error box with a left accent bar.** The "callout with a coloured left border" is a stock AI component. Replace it with the new error panel (Section 4.6).
14. **Disabled-looking hint buttons** ("Plan", "Shape" greyed out with thin borders) that look broken, not locked.
15. **Text overlapping the floating circle in the bottom left.** That circle is the Next.js dev indicator. Set `devIndicators: false` in `next.config` (or move it) so screenshots are clean. Also, the "Three loaves" check card text is cut off and overlaps. Fix all overflow.
16. **Everything is the same visual weight.** No hierarchy. The editor, the most important thing on screen, doesn't look more important than the step list.

### 2.2 The rule from now on

The product must have a **committed, specific identity that could only belong to Fixwick**: a game. The current build tried to be "tasteful and neutral", and neutral is exactly what generated design looks like. The new direction is the opposite. It is bold and game-like, built from pixel UI parts, and dark by default, with the editor treated as the star.

Use these as a mood reference. Study how their interfaces feel. Do not copy any of their assets.
- **Stardew Valley** and **Eastward**: chunky framed menus, warm pixel portraits in dialogue boxes, clear item icons.
- **Celeste** and **A Short Hike**: readable text on dark panels, characterful portraits with several expressions, restraint.
- **Balatro**: bold colour on a dark ground, very chunky buttons with real press states, confident type.
- **Real code editors** (VS Code dark themes, Zed): the editor area should feel like a professional tool, because learners are meant to get used to one.

Do not resemble any of these: Claude.ai, the Anthropic website, ChatGPT, Notion, Linear, generic shadcn/ui dashboards, Vercel templates, or any SaaS landing page.

---

## 3. New design system

Delete the old `tokens.css` values and rebuild them from this section. Every component must use tokens. No raw hex values in components.

### 3.1 Palette

One palette serves both the pixel art and the UI, so the game and the tool finally look like one product. Dark mode is the **default and primary** theme ("night shift at the workshop"). Light mode is secondary ("daytime").

Define these in `palette.json` and generate `tokens.css` from it. The hex values below are the starting point. You may adjust them by small amounts to pass contrast checks. Record any change in `DECISIONS.md`.

**Night (default)**

| Token | Hex | Use |
|---|---|---|
| `--night-0` | `#0E1218` | page background behind everything |
| `--night-1` | `#161C25` | main panels, editor background |
| `--night-2` | `#1F2733` | raised panels, console |
| `--night-3` | `#2C3747` | frame mid-tone, inactive buttons |
| `--night-4` | `#3D4B60` | frame highlight edge, selection |
| `--fog` | `#8E9AAB` | secondary text (check contrast on `--night-1`) |
| `--chalk` | `#ECE6D6` | primary text |
| `--lamp` | `#F4C04E` | primary action (Check), highlights, current step |
| `--lamp-dark` | `#B5852A` | bottom edge of lamp buttons |
| `--kelp` | `#5DBB63` | Run button, passing checks |
| `--kelp-dark` | `#3A7F3F` | bottom edge of kelp buttons |
| `--brick` | `#E0563F` | failing checks, errors, the credit heart |
| `--brick-dark` | `#9E3526` | bottom edge of brick buttons |
| `--sea` | `#4FA3C7` | links, info, selected tab |
| `--sea-dark` | `#2F6E8C` | bottom edge |
| `--rust` | `#A8613A` | wood, warm props, secondary accents |
| `--moss-green` | `#6E8B3D` | Moss's character colour, nature |
| `--plum` | `#7A4E6E` | sparing use only (one character, night sky accents). Never in gradients. |

**Day (light mode)**: a cool, pale harbour morning. Do not use cream or beige.

| Token | Hex |
|---|---|
| `--day-0` | `#DCE6EC` |
| `--day-1` | `#EEF3F6` |
| `--day-2` | `#FFFFFF` (editor only) |
| `--day-3` | `#BCC9D3` |
| `--day-ink` | `#18202A` |
| `--day-fog` | `#4D5A69` |

Accents (lamp, kelp, brick, sea) stay the same in both modes, darkened where needed for contrast.

**Banned colours and treatments:** cream, beige or "paper" backgrounds (`#F4F1EA`, `#FAF7F0`, `#F5F0E8` and anything near them). Any purple-to-pink or blue-to-purple gradient. Any gradient on a button, text or panel. Neon glows. Translucent frosted panels. The amber `#C8811E` family.

### 3.2 Typography

Three faces only. **No serif anywhere in the product.**

1. **Pixel display font**, for: the wordmark, headings in game chrome (Act titles, job ticket title, dialogue name plates), button labels, tab labels, the HUD, and dialogue text.
   - First choice: **m6x11plus** by Daniel Linssen (free; check the licence on the author's itch.io page and credit it in `CREDITS.md`).
   - Fallback: **Pixelify Sans** (SIL OFL, Google Fonts; self-host it).
   - Use it only at whole-number multiples of its native pixel size (for m6x11 that is 22px, 33px, 44px for 2x, 3x, 4x). Use `-webkit-font-smoothing: none` and `font-smooth: never` where supported, so it stays crisp.
   - Never use Press Start 2P. It is the overused default "retro" font.
2. **Reading font**, for: lesson explanations, error explanations, longer descriptions, settings and legal pages.
   - **Atkinson Hyperlegible Next** (SIL OFL, from the Braille Institute; self-host it). 17px on desktop, 16px on phone, line height 1.55, max line length about 68 characters.
   - Weights 400 and 700 only. Never italic emphasis inside headings.
3. **Code font**, for: the editor, console, inline code and test output.
   - **JetBrains Mono** (OFL). 15px in the editor by default, user-adjustable.
   - Inline code in prose: code font, a `--night-3` background, 2px padding, 0 radius.

Banned as main faces: Inter, Roboto, Poppins, Montserrat, Open Sans, Lato, Space Grotesk, DM Sans, Manrope, Geist, Source Serif, Literata, Fraunces, Playfair, any serif, and the system UI stack.

### 3.3 Shape, frames and depth

The UI is made of **pixel frames**, not CSS boxes.

- **9-slice frames:** draw three frame styles in the sprite pipeline, each as a 24x24 PNG with an 8px corner, applied with CSS `border-image` at 2x scale (`border-image-slice: 8; border-width: 16px; image-rendering: pixelated`):
  - `frame-panel`: dark wood-and-iron panel frame for main panels (`--night-3` body, `--night-4` top-left highlight, `--night-0` bottom-right shadow, 1px darker outline).
  - `frame-paper`: a pinned paper ticket, used **only** for the job ticket and Shelf labels. This is the one light object in the dark world. It is a game item, not a page background.
  - `frame-dialogue`: the dialogue box, with a name plate tab.
- **Corners:** stepped pixel corners from the frames. No `border-radius` anywhere in the tool UI except 0. Do not round any corner with CSS.
- **Depth:** depth comes from pixel highlight and shadow edges inside the frames, and from a hard 4px offset shadow (`box-shadow: 4px 4px 0 var(--night-0)`) on floating things like menus. No soft blurred shadows. No `backdrop-filter`.
- **No 1px grey hairline borders** to separate regions. Separate regions with frames, background steps (`--night-0` → `--night-1` → `--night-2`) and space.

### 3.4 Spacing and grid

- Base unit 4px. Use only multiples of 4.
- Pixel art and frames sit on a 2px grid at 2x scale, so they never land on half pixels. Snap sprite positions to whole device pixels.

### 3.5 Motion

- Motion is short, stepped and game-like. Use `steps()` timing for sprite animation, and 80 to 120 ms linear moves for UI.
- Allowed: button press (2px down), dialogue typewriter text (skippable, instant under reduced motion), a stamp thud when a project ships, a lamp flicker on the map, portrait blink, rain.
- Not allowed: fade-up on scroll, hover lift on cards, bouncing, parallax, spinning loaders. The loader is a two-frame pixel spanner turning.
- `prefers-reduced-motion`: all idle animation off, typewriter off, stamp shown without the thud.

### 3.6 Icons

- One pixel icon set, 12x12 or 16x16, drawn in the sprite pipeline on the palette: run (triangle), check (tick), stop (square), hint (lightbulb drawn as a lamp, to fit the town), history (clock), reset (curved arrow), keyboard, settings (spanner), duck, shelf, map, lock, heart.
- Never use Lucide, Heroicons, Font Awesome or any line-icon set in the visible UI. They are the strongest "template" signal next to fonts.

---

## 4. Component rebuild

Rebuild every shared component on the new tokens. Delete the old components' CSS once the new ones are in use.

### 4.1 Buttons

Chunky game buttons with a real press:

- Height 40px (desktop), 44px (phone). Pixel display font label, often with a 12px pixel icon.
- Face colour on top, a 4px darker bottom edge (`box-shadow: inset 0 -4px 0 var(--x-dark)`), a 2px `--night-0` outline.
- Hover: face lightens one step. Active: the button moves down 2px and the bottom edge shrinks to 2px. Focus: a 2px `--lamp` outline offset 2px, stepped corners.
- Variants: `primary` (lamp, dark text), `go` (kelp, dark text; used only for Run), `danger` (brick), `quiet` (night-3 face, chalk text; used for Reset, History and so on).
- Disabled and locked are different. **Disabled:** dimmed face, no bottom edge. **Locked** (for example the "Plan" hint before "Nudge" is used): normal quiet button with a small pixel lock icon and a tooltip "Use Nudge first."
- Keyboard shortcut hints are not shown inside buttons. They live in the Keys sheet and in tooltips.

### 4.2 Tabs

Pixel-font labels on `--night-2` tabs. The selected tab joins the panel below it (same colour, no bottom edge), like a folder tab. No underline indicators.

### 4.3 Editor (CodeMirror 6)

- A custom theme named `fixwick-night` built from the palette: background `--night-1`, gutter `--night-0` with `--fog` line numbers, active line a single step lighter, selection `--night-4`.
- Syntax colours from the palette: keywords `--sea`, strings `--kelp`, numbers `--lamp`, comments `--fog` (not italic), functions `--chalk` bold, builtins `--rust` lightened. Check contrast.
- An error line gets a brick-coloured gutter marker (a pixel "!" icon) and a subtle `--brick` tint at 15% opacity. No pink.
- A day theme `fixwick-day` for light mode.

### 4.4 Console and output

- `--night-2` panel inside a `frame-panel`. Code font. Program output in `--chalk`, the learner's typed input in `--lamp`, tracebacks in `--brick`.
- The `input()` prompt shows a blinking block cursor (two-frame, steps) inline in the console, like a real terminal. No separate text box below.

### 4.5 Check report

- A header line in the pixel font: "4 of 5 checks passed".
- Each check is a row with a pixel icon (tick in kelp, cross in brick, dash in fog for not run), a short name, and on expand: input, expected, got, side by side in the code font.
- The first failing check is open by default. Long values scroll horizontally inside their own box and never overflow the panel.

### 4.6 Error explanation panel

Replaces the pink left-border callout.

- Appears under the traceback in the console, in a `frame-dialogue` with **Moss's portrait** (the "squinting" expression) on the left and his name plate.
- His line is in the pixel font (short, in character). The plain explanation below it is in the reading font.
- Example:
  > **Moss:** Read it from the bottom. The last line is where it hurt.
  > `qty` came from `input()`, so it's text, even though you typed 3. Text can't be multiplied by 2.40. Turn it into a number first with `int()`.
  > [Go to line 4] (a quiet button)

### 4.7 Toasts and save status

- Save status lives in the HUD as a small pixel icon: a floppy disk (saved), a spinning spanner (saving), or a cloud with a cross (offline). Tooltip text gives the details. No grey "Saved on this device" text.
- The guest call to action is a real button in the HUD, `primary` variant: "Save my progress".

---

## 5. Screens, rebuilt

Screenshot each screen at 1440x900 and 390x844, in night and day mode, before and after. Put the screenshots in `/tests/screenshots/redesign/`.

### 5.1 The Workbench (main learning screen)

The editor is the star. The layout is a game screen, not a docs page.

```
+--------------------------------------------------------------------------------+
| HUD: [weathervane] Fixwick  >  Harbour Front  >  Project 3   ... [floppy] [map] [gear] |
+--------------------------------------------------------------------------------+
| Step path: (1)--(2)--(3)--[4]--(5)--(6)--(7)        [Hint: lamp] [Duck]          |
+------------------------+-------------------------------------------------------+
| JOB TICKET (paper)     |  main.py  |  helpers.py  |               [Run] [Check]  |
|  Bill Splitter         |-------------------------------------------------------|
|  for Bea's bakery      |                                                       |
|  ~30 min               |                 EDITOR (largest area)                 |
|                        |                                                       |
|  What it does:         |                                                       |
|  ...                   |                                                       |
|  Example run:          |-------------------------------------------------------|
|  ...                   |  [Output] [Checks]                                    |
|  This step:            |   console / check report                              |
|  Fix Pip's version...  |                                                       |
+------------------------+-------------------------------------------------------+
| DIALOGUE BOX: [Portrait 192px]  PIP  "Done already. It crashes, but it's done." [>] |
+--------------------------------------------------------------------------------+
```

Rules:

- **HUD (top, 48px):** wordmark icon, breadcrumb in the pixel font, then on the right the save icon, a map button, a settings button and the account avatar (the learner's character head, 16x16 at 2x).
- **Step path (below the HUD):** steps drawn as pixel nodes joined by a dotted path, like a world-map level path. Done steps show a small tick, the current step is a larger lamp-coloured node, and future steps are dim. Hovering a node shows the step name in a tooltip. This replaces the vertical step list.
- **Job ticket (left, 300px, collapsible):** the brief on a `frame-paper` ticket, pinned with a pixel tack. Title in the pixel font (dark ink on paper), the client's tiny 16x16 head icon, estimated time, "What it does", the example run in code font, and then a divider made of a torn-paper edge. Below it: "This step:" with the step's instruction in the reading font. Visible example checks are listed at the bottom of the ticket. No eyebrow labels anywhere.
- **Editor (centre, flexible, at least 60% of the width on desktop):** file tabs, Run (`go`) and Check (`primary`) on the right of the tab row. The quiet buttons (Reset, History, Keys) sit in a small `...` menu, not as a row of grey words.
- **Output and Checks (under the editor, resizable split, default 35% of the height).**
- **Dialogue box (bottom, full width, 120 to 160px, collapsible to a single line):** a game dialogue box. A large portrait on the left (64x64 drawn, shown at 3x = 192px, cropped to the box height if needed), a name plate tab in the character's colour, the line in the pixel font with typewriter reveal, and a small "next" arrow that bobs. Click or press Space (when the editor isn't focused) to advance. "Less talk" mode keeps the box at one line.
- **Hints:** a "Hint" button with the lamp icon in the step path bar. Pressing it opens Moss in the dialogue box with three chunky buttons: Nudge, Plan, Shape (locked in order, Section 4.1).
- **Dennis:** a 24x24 duck sprite button in the step path bar. Clicking him opens the "Explain it to Dennis" drawer from the right as a `frame-panel`.
- **No room scene on the Workbench.** The full room scene appears only in the Ask and Ship cutscenes and on the map. The Workbench is for work.
- **Phone layout:** the HUD stays. The step path becomes a horizontal scroller. Ticket, Code and Output become three big pixel tabs. The dialogue box docks above the tabs as one line with a 48px portrait, and expands on tap.

### 5.2 Ask and Ship cutscenes

These are where the art gets to shine.

- **Ask:** a full-width scene at the top of the screen, with the workshop interior drawn properly (Section 6.4) and the client walking in through the door (four-frame walk). Then the dialogue box runs the client's lines with their portrait changing expression. Then the job ticket slides in and pins itself. Skippable with one button ("Skip"). Replayable from the ticket.
- **Ship:** the program runs once in a "demo" panel styled as the client using it (for example the bill splitter's output appears on Bea's till screen). The client reacts with the right portrait expression. A rubber stamp "SHIPPED" hits the ticket (one thud frame, a 2-frame dust puff). The finished project object flies to the Shelf icon in the HUD.

### 5.3 Landing page

Lead with the product, not marketing.

- **Top, full width:** a live pixel scene of Fixwick harbour at dusk (lamps flickering, gulls, the workshop's lit window, rain optional), drawn at 3x, with the wordmark sprite and the tagline over the sky in the pixel font. One `primary` button: "Start the first job (free, no sign-up)". One `quiet` button: "See every project".
- **Second band:** the playable first project in a cut-down Workbench, framed like a game window with a title bar. Not a screenshot: the real thing.
- **Third band: "What you'll build."** A shelf, drawn in pixels, holding objects that represent real projects from across the course (a calculator, a tiny arcade cabinet, a weather vane for the weather app, a spam filter envelope, a neural net drawn as a little brass machine, a racing crab for the RL agent). Each object has a plain label in the reading font. Hovering an object shows one line about the project: "Spam filter. Train a Naive Bayes model on 5,000 real messages." This band shows that the projects are real.
- **Fourth band: the map** of all districts with what you learn in each, written plainly, with the full syllabus expandable as a pixel-font list.
- **Fifth band: pricing** (Section 8.4).
- **Footer:** links (Syllabus, Pricing, FAQ, Python Handbook, Credits, Privacy, Terms), and the credit line (Section 1.3).
- Layout: asymmetric where it helps. Do not use a centred hero over a gradient, a three-card features grid, a testimonials carousel (none exist yet) or fake numbers.

### 5.4 Map

- The top-down town map at 3x scale on a `--night-0` sea, pannable and zoomable in whole-number steps (2x, 3x, 4x).
- Districts unlock with visible change: lamps on, shutters up, smoke, people walking.
- A district click opens a `frame-panel` side sheet listing its projects as paper tickets (title, client head, time, status stamp: none, in progress, SHIPPED, SHIPPED+ for stretch done).
- A list view toggle for accessibility, styled as a logbook.

### 5.5 Shelf, Morning Rounds, Drills, Handbook, Settings

- **Shelf:** wooden shelves in the workshop back room (pixel art). Each shipped project is an object. Clicking one opens a `frame-panel` with the code, Run, Download, and "Push to GitHub".
- **Morning Rounds:** cards are small `frame-paper` repair slips with the related client's head. One card at a time, with a mini editor.
- **Drills:** a "speed bench" with a pixel stopwatch. Pip's ghost time is shown as his head icon on a progress bar.
- **Handbook** (was the Concept Index): see Section 9.1.
- **Settings:** grouped `frame-panel`s. Account, Character, Editor, Dialogue, Sound, Motion, Billing (Section 8). The credit line goes at the bottom.

---

## 6. Characters: much better

The owner wants the characters to be much better: more appealing, more expressive, better drawn and better written. Treat the cast as the product's mascot layer. People should remember Pip the way they remember the Duolingo owl.

### 6.1 What was wrong

- Sprites were too small (32x32) to carry expression, and drawn in the same muddy browns as the background, so they disappeared.
- Silhouettes were unclear. Moss didn't read as a tortoise.
- One portrait was used for every emotion, so the characters never reacted.
- The writing was fine but the characters didn't respond to what the learner actually did.

### 6.2 Art specification

**Sizes**
- **World sprites** (map, cutscenes): 32x48 for most characters (Moss 48x40, Dennis 16x16), drawn at 1x and displayed at 3x.
- **Dialogue portraits:** 64x64, displayed at 3x (192px). Head and shoulders, facing three-quarters right, with a consistent crop and eye line across all characters.
- **Head icons:** 16x16, for tickets, HUD and review cards.

**Construction rules** (apply to every character)
1. **Silhouette first.** Fill the character in solid black. It must be recognisable from the silhouette alone at 1x. A tortoise must have a dome shell and a beak-like head. A pigeon must have a round chest, a small head and a tail. Do this test and keep the silhouette images in `sprites/review/`.
2. **One signature colour per character** that no one else uses as a main colour, so they are recognisable at 16x16: Moss is moss green and brass, Pip is slate grey with a teal-violet neck, Bea is tomato red, Captain Ferro is navy, and so on (Section 6.3).
3. **Colour ramps with hue shifting.** Each material has 3 to 4 shades. Shadows shift cooler (toward blue), highlights shift warmer (toward yellow). No straight darker/lighter versions of the same hue.
4. **Contrast against the background.** Characters use more saturated colour and lighter values than the environment, which is kept desaturated. They must pop off the scene.
5. **Selective outline.** 1px outline that is the darkest shade of the adjacent colour, never pure black. Interior lines only where needed.
6. **Big readable faces.** In portraits the eyes take 2 to 4 pixels each with a 1px highlight. Expression comes from eyebrows (1 to 2 pixel lines), eyelids and mouth shape.
7. **Light from top-left**, consistent across every sprite.
8. **No anti-aliasing**, except deliberate 1-pixel AA on large curves in portraits, using palette colours only.

**Expressions per main character portrait** (minimum): neutral, talking (2 frames, mouth open and closed), pleased, proud, worried, confused, annoyed, laughing, squinting (reading code), surprised. Clients need at least: neutral, talking (2), pleased, worried, confused, delighted.

**Idle animation in portraits:** blink every 3 to 6 seconds (randomised), and one small character-specific idle (Moss's glasses slip down his head, Pip's head bobs, Bea brushes flour off her sleeve). These play at 4 to 6 fps with `steps()`.

**How to draw them:** keep using the text-grid source format in `sprites/src/`, but:
- Draw portraits at 64x64 with care. Expect to iterate. For each character, render the sheet at 1x and at 4x, look at it, write down three specific problems, fix them, and repeat at least three times. Save the before and after sheets in `sprites/review/<name>/` so the owner can see the progression.
- Build a `/dev/sprites` page (development only) that shows every sprite and every expression, at 1x, 3x and as silhouettes, on night and day backgrounds. Use it to review.
- Keep the pipeline open to **drop-in replacement with hand-drawn PNGs** from Aseprite (same sheet layout plus a JSON frame map). The owner may commission a pixel artist for the launch versions of the main cast. Document the exact sheet layout, frame order and palette in `sprites/README.md`, written so an artist can follow it.

### 6.3 The cast, redesigned

Keep the core three and make them better. Tighten the clients so each one owns an Act and has a small arc. All the voice rules from the original prompt still apply: short lines, no exclamation marks except once per project at most, no emoji, no em dashes, no fourth-wall breaks, no generic praise.

**Moss** (mentor)
- **Look:** an old tortoise, broad and low. A domed moss-green shell with hexagonal plates outlined in darker green, and **one cracked plate repaired with a riveted brass patch**. That patch is his visual signature and should catch the light. A brown leather apron with a spanner in the pocket. Round brass-rimmed glasses pushed up on his head, which slip down when he concentrates (idle animation). Heavy-lidded, kind eyes. A slow, deliberate head tilt.
- **Signature colours:** moss green and brass.
- **Personality:** patient, dry, exact. Loves good tools and honest names. Distrusts anything "clever". Secretly delighted by the learner's progress and bad at saying so.
- **Arc:** he has been failing to fix an old valve radio for years. Over the course the learner helps him read its schematic, which is a program in disguise. In the final Act it plays music, and he finally says something warm.
- **Reacts to the learner's code:** good variable names ("`total_price`. Good. I know what it holds."), and long functions ("That function does four jobs. Give three of them away.").

**Pip** (rival and friend)
- **Look:** a scruffy, compact city pigeon with a puffed chest. Slate-grey feathers with a darker wing bar, and an **iridescent neck that shifts teal-to-violet** (a 2-frame shimmer when he's proud). A stubby pencil behind one eye, and a satchel overflowing with crumpled printouts. Bright orange eyes, a lot of attitude. He leans forward when he talks.
- **Signature colours:** slate grey with a teal-violet neck.
- **Personality:** fast, confident, funny, usually wrong in specific and believable ways. Never stupid. Competitive with the learner in Drills.
- **Arc:** he starts by "fixing" everything with extra `if` statements. His bugs grow up with the learner: off-by-one, mutable defaults, train/test leakage, reward hacking in the RL act. By the end he writes his first test before his code, and he credits the learner for it in his own clumsy way.
- **Reacts to the learner's code:** if the learner passes faster than his Drill ghost: "That was luck. Do it again." If the learner's code is shorter than his: "Mine had more features." (It didn't.)

**Dennis** (debugging duck)
- **Look:** a classic yellow rubber duck with an orange beak, a **chip out of the beak** and slightly faded paint on one side. 16x16. Never speaks.
- **Role:** "Explain it to Dennis". After the learner writes an explanation, one narration line appears in the dialogue box with no name plate: "Dennis listens." / "Dennis tilts, very slightly." / "Dennis has heard worse."
- **Collectible:** twelve hidden Dennises around the map, with a small reward from Moss at the end.

**The learner's character**
- Built at sign-up from layered parts at 32x48 and 64x64 (portrait): species (otter, hare, badger, fox, heron, frog, mole, seal), fur or feather colour (6), jumper (8), accessory (scarf, beanie, round glasses, cap, headphones, none), and expression set (the same 6 for every species).
- The learner's portrait appears in the dialogue box when the learner "speaks". This is rare, used for choices in story moments.

**Clients** (one per Act, plus a few recurring)
- **Bea Hollis**, baker (Act I). Round, rosy, tomato-red headscarf, flour handprints on her apron, wooden spoon. Practical, warm, suspicious of computers, counts everything twice. Arc: from "I don't trust it" to running her whole bakery on the learner's programs.
- **Captain Ferro**, ferry captain (Act I, Act IV). A huge navy greatcoat, an enormous white beard that hides his mouth (so his expressions are all eyebrows), and a pipe. Talks in nautical terms. Wants everything "shipshape", which means tested.
- **Mira Tan**, postmistress (Act II). Neat, small, round glasses, a mustard cardigan with a pen in every pocket. Loves labels, lists and order. Becomes the learner's ally for files and data.
- **Dev and Kat**, siblings at the bike and boat hire (Act II, Act III). Matching cycling caps in opposite colours. They argue constantly, which makes them perfect for debating inheritance versus composition and Flask versus "just a script".
- **Nell Brannigan**, scrapyard (Act IV, algorithms). Huge gloves, welding goggles on her forehead, a booming laugh. Knows where everything is in her piles and can't explain how. That is the point of the algorithms Act.
- **Priya Lund**, weather station (Act V, data). Lab coat over a raincoat, a clipboard, a careful squint. Objects to dishonest charts.
- **Professor Ines Wendt**, observatory (Acts VI and VII, ML and deep learning). Wild grey hair, star-patterned scarf, corrects herself mid-sentence. Enthusiastic and rigorous.
- **The Arcade Committee** (Act VIII, RL): three identical old men in matching green blazers who run the pier arcade and take its leaderboards far too seriously. Their crab mascot, **Sir Reginald**, is the RL agent sprite.
- **Ada Penhallow**, the missing engineer. Seen only in an old photo until the end. Her code comments teach good commenting. Her sprite at the reveal is the most detailed in the game.

### 6.4 Scenes

Redraw the workshop interior as a proper composed scene at 320x180 (displayed at 3x or 4x):
- A clear foreground (the bench and the learner's desk), midground (Moss's bench, the radio, the door) and background (shelves and window). Use fewer props, each bigger and more readable. Leave empty wall space so the characters stand out.
- Background in desaturated cool tones; characters and the warm lamp light in saturated warm tones.
- Rain on the window and a lamp glow, both animated.
- Draw the harbour exterior, the map tiles and each Act's key building with the same rules.

### 6.5 Dialogue writing upgrades

- **Reactive lines.** Characters react to real events in the learner's code, using cheap static checks (via `ast`) and run results: the first time they use an f-string, a loop that never runs, a very long line, a passing check on the first try, the third failed attempt, a variable called `x` holding a price, and so on. Write at least 40 reactive lines across Moss and Pip for Act I.
- **Running jokes** that pay off: Moss's empty biscuit tin (it is full in the final scene), Ferro's beard eating his words, Pip's satchel growing as his printouts pile up, then shrinking once he starts testing.
- **No repeats.** Track the last 30 lines shown to each user and don't repeat a line from that list.
- **Recap on return.** When the learner comes back after a break: one line from Moss plus one line from the current client about where they were. Never guilt.

---

## 7. Curriculum: real projects

The owner's feedback: projects should not be "random silly projects for a game". They must be **real programs people actually build and use**, such as calculators, trackers, games, web apps, scrapers, data dashboards and ML models, the kind of thing in a respected beginner book like *Python Crash Course* (basics first, then real projects: an arcade game, data visualisation, a web app). Then the course carries on into algorithms, machine learning, deep learning and reinforcement learning.

### 7.1 The rule

- Every project is a **real, standard program type with a plain name**: "Bill Splitter", "To-Do List", "Expense Tracker", "Weather Dashboard", "Spam Filter". The client and the story give it a reason. They do not rename it.
- Project tickets show the plain name first and the client second: **"Bill Splitter"**, then "for Bea's bakery".
- Every project ends as something the learner could **keep using, show to someone, or put on GitHub**. Each shipped project can be downloaded as a runnable folder with a README.
- Projects use **real data** where data is involved: public datasets (Our World in Data, NOAA weather, UCI datasets, Kaggle open datasets with permissive licences, MNIST, SMS Spam Collection, and so on). Record every dataset's source and licence in `CREDITS.md`. Bundle small cleaned copies so they work offline in the browser.
- Do not copy text, exercises or code from *Python Crash Course* or any other book. Use it only as a reference for the pacing (fundamentals → real projects) and the kinds of projects.

### 7.2 New Act structure

Nine Acts. **Act I is free.** Everything after needs Pro (Section 8). The Fixwick district for each Act is in brackets.

#### Act I: Foundations (the Harbour Front), free, about 25 hours
1. **Shop Sign:** print, strings, comments, running code.
2. **Bill Splitter:** numbers, variables, input, int/float, f-strings, rounding.
3. **Reading Tracebacks:** fix five broken real scripts. The four common error types.
4. **Unit Converter** (Ferro's knots, miles and kilometres): if/elif/else, comparisons, menus.
5. **Password Checker:** string methods, `len`, `in`, booleans, combining conditions.
6. **Times Table Trainer:** for, range, nested loops, formatted tables.
7. **Number Guessing Game:** while, random, break, attempts.
8. **To-Do List:** lists, indexing, append/remove, loops over lists, a menu loop.
9. **Contact Book:** dictionaries, `.get`, nested data, search.
10. **Grade Calculator:** functions, parameters, return values, scope.
11. **Rock Paper Scissors:** functions plus random plus a score dictionary. First "whole game".
12. **Four-Function Calculator:** parsing input, error handling with try/except, a loop until quit.
13. **Act I capstone: Expense Tracker:** menu-driven CLI. Add expenses with categories, list them, totals per category, biggest expense. Lists of dictionaries and functions.

#### Act II: Fluent Python (the Post Office and High Street), Pro, about 45 hours
1. **Password Generator:** the `random` and `string` modules, function arguments and defaults.
2. **Word Counter and Text Analyser:** reading files, `Counter`, sorting by value, a top-10 report from a real public-domain book.
3. **File Organiser:** `pathlib`, sorting a messy folder by file type (a virtual folder in the browser, a real folder in the Take It Home version).
4. **Habit Tracker:** JSON save and load, dates with `datetime`, exceptions.
5. **Quiz App:** a question bank in JSON, shuffling, scoring, comprehensions.
6. **Bank Account System:** classes, methods, `__str__`, validation.
7. **Library Manager:** inheritance versus composition (Dev and Kat argue), dataclasses, type hints, Enum.
8. **Text Adventure Engine:** rooms as a dictionary graph, a game loop, a class-based state.
9. **Testing the Bank:** pytest, test cases, edge cases, test-first changes.
10. **CSV Budget Report:** the `csv` module, grouping, a monthly report.
11. **Command-Line To-Do Tool:** argparse, persistent storage, a proper CLI.
12. **Iterators and Generators:** a log streamer that processes a large file lazily.
13. **Decorators and Functional Tools:** a timing and retry decorator, `lambda`, `sorted(key=)`.
14. **Git and GitHub:** in-browser simulated git, then a real Take It Home setup that pushes the learner's first repository.
15. **Act II capstone: Personal Finance App:** classes, JSON storage, tests, CLI, reports, all in a real package layout.

#### Act III: Real-World Python (the Pier and Arcade), Pro, about 40 hours
Inspired by the "real projects" half of a good beginner book. Some parts run in the browser, some in Take It Home.
1. **Weather App:** calling a real web API (Open-Meteo needs no key and allows browser requests), JSON parsing, error handling, a nice text forecast.
2. **Web Scraper:** HTML parsing with BeautifulSoup on saved pages in the browser, then a polite real scraper in Take It Home (robots.txt, rate limits, ethics).
3. **Automation Pack:** generate an Excel report with `openpyxl`, merge PDFs, rename hundreds of files. Take It Home.
4. **Snake:** a real-time game loop with a simple canvas game library in the browser (`pygame-ce` if available in Pyodide, otherwise a small provided wrapper), then the Pygame version at home.
5. **Arcade Shooter:** a full 2D arcade shooter in Pygame (Take It Home): sprites, classes, collisions, levels, scoring, sound. A multi-session project.
6. **Flask Web App:** a notes or link-shortener app with routes, templates, forms and SQLite. Take It Home.
7. **Web App with Accounts:** user accounts, sessions, password hashing.
8. **Deploy It:** put the Flask app online on a free host, with a custom URL.
9. **Chat Bot:** a Discord or Telegram bot (Take It Home) that uses the learner's earlier code (the quiz or weather app).
10. **Act III capstone: Deployed Web App:** the learner's own idea, deployed, with a README and tests.

#### Act IV: Algorithms and Data Structures (the Scrapyard), Pro, about 45 hours
1. **Speed Tester:** timing code, Big-O, growth charts.
2. **Search Engine for a Parts List:** linear versus binary search.
3. **Sorting Visualiser:** selection, insertion, merge and quick sort, animated.
4. **Recursive File Tree Printer:** recursion, call stack, memoisation.
5. **Undo/Redo Text Editor:** stacks and queues.
6. **Hash Map from Scratch:** how dictionaries work.
7. **Autocomplete:** tries.
8. **Task Scheduler:** heaps and priority queues.
9. **Maze Solver:** graphs, BFS, DFS, visualised.
10. **Route Planner:** Dijkstra and A* on the town map.
11. **Sudoku Solver:** backtracking.
12. **Spell Checker:** dynamic programming (edit distance).
13. **Act IV capstone: Interview Prep Set:** 20 timed problems at first-year CS and junior interview level.

#### Act V: Data Science (the Weather Station and Records Office), Pro, about 40 hours
1. **NumPy Grade Book:** arrays, vectorisation, broadcasting.
2. **Data Cleaning Pipeline:** pandas on a messy real dataset.
3. **Weather History Dashboard:** a century of real weather data, groupby, resampling, matplotlib.
4. **Interactive Charts:** Plotly charts in the browser, exported as a shareable HTML page.
5. **Earth Data Map:** plotting real geographic data on a map.
6. **Statistics Toolkit:** distributions, sampling, permutation tests, correlation versus causation.
7. **Linear Algebra Lab:** vectors and matrices as geometry, with images as matrices.
8. **Calculus for ML:** derivatives and gradients numerically.
9. **Act V capstone: Data Story:** a full analysis of a public dataset of the learner's choice, published as a web page.

#### Act VI: Machine Learning (the Observatory, lower floors), Pro, about 45 hours
1. **House Price Predictor:** linear regression from scratch, gradient descent, then scikit-learn.
2. **Exam Score Model:** multiple features, scaling, train/test split, overfitting.
3. **Spam Filter:** Naive Bayes on the SMS Spam Collection, precision and recall.
4. **Diabetes Risk Classifier** (or a similar public health dataset): logistic regression, ROC, class imbalance.
5. **Iris and Penguins Classifier:** k-NN from scratch, choosing k.
6. **Loan Approval Tree:** decision trees from scratch, then random forests and gradient boosting.
7. **Movie Recommender:** collaborative filtering on MovieLens.
8. **Customer Segmentation:** k-means and PCA.
9. **Model Evaluation Clinic:** cross-validation, pipelines, data leakage, fairness.
10. **Act VI capstone: End-to-End ML Project:** a real dataset, cleaned, modelled, evaluated and written up.

#### Act VII: Deep Learning and AI (the Observatory, upper floors), Pro, about 60 hours
1. **Neural Network from Scratch:** NumPy, forward pass, backprop, checked with numerical gradients.
2. **Tiny Autograd Engine:** a micrograd-style engine with graph visualisation.
3. **Handwritten Digit Recogniser:** the NumPy network on MNIST, then a draw-a-digit web demo.
4. **PyTorch Fundamentals:** tensors, autograd, `nn.Module`, training loops (Take It Home).
5. **Image Classifier:** a CNN on a public image dataset, with augmentation and regularisation.
6. **Sentiment Analyser:** embeddings and an LSTM on movie reviews.
7. **Tiny GPT:** a character-level transformer that writes text in the style of a public-domain book.
8. **Using Pretrained Models:** Hugging Face pipelines, fine-tuning a small model.
9. **AI App:** build a small app on a large language model API, including prompting, evaluation and cost control.
10. **Act VII capstone: Deep Learning Project:** a model plus a web demo, deployed.

#### Act VIII: Reinforcement Learning (the Pier Arcade), Pro, about 50 hours
1. **A/B Test Bandit:** epsilon-greedy, UCB, Thompson sampling.
2. **Gridworld Solver:** MDPs, value iteration, policy iteration.
3. **Tic-Tac-Toe Agent:** Monte Carlo methods and self-play.
4. **Q-Learning Crab:** tabular Q-learning, with Sir Reginald learning the racing track live.
5. **Snake AI:** Q-learning on the learner's own Snake game from Act III.
6. **CartPole with DQN:** replay buffer and target network (Take It Home with Gymnasium).
7. **Policy Gradients:** REINFORCE with a baseline.
8. **Actor-Critic and PPO:** reading and modifying a real PPO implementation.
9. **Act VIII capstone: Arcade League:** train an agent and enter it into the weekly league (opt-in leaderboard).

#### Act IX: The Lighthouse (capstones and portfolio), Pro
- Pick two capstones from a brief list, or propose one.
- A **Portfolio Builder** that turns shipped projects into a GitHub profile README and a public portfolio page.
- A **University and Interview Readiness** track: a timed first-year CS problem set, and practice explaining your own projects.
- The story ends: Ada Penhallow is found, Moss's radio plays, the town is fixed.

### 7.3 What to do with existing content

- Rewrite the existing Act I jobs to the new project list. Reuse the step content where it fits (Bea's till becomes the Bill Splitter; the predict questions on `input()` still apply).
- Keep the quality bar of the worked example in the original Section 14.1, now applied to "Bill Splitter".
- Update `scripts/validate-content.ts` so every project has: a plain `project_name`, a `client`, a `portfolio_readme` template, a `downloadable` flag, and a `datasets` list with licences where relevant.

---

## 8. Making money: Pro subscription

### 8.1 The model

Freemium subscription. **No ads.**

- **Free:** all of Act I (13 projects), the review deck and Drills for Act I concepts, the Shelf and downloads for everything built in Act I, the public Python Handbook (Section 9.1), and the first project's Ask scene of every later Act as a preview.
- **Pro:** every Act, every project, Drills and review for all concepts, Take It Home kits, GitHub push for all projects, the Arcade League, capstone reviews and the certificate of completion for each Act.
- **No ads anywhere, including on free pages.** Ads would break the art direction, distract learners mid-code, and earn very little on a single-page app where people stay on one screen for an hour. Also, many learners will be under 18, which restricts ad targeting.
- **Your work is always yours.** If a subscription lapses, the learner keeps read and download access to everything they built and all their progress. Only new Pro content locks. Make this promise visible on the pricing page. It builds trust and reduces refund requests.

### 8.2 Prices (make them configurable)

Put prices in `lib/plans.ts` and the payment provider's dashboard, never hard-coded in components. Starting values:

| Plan | Price | Notes |
|---|---|---|
| Free | 0 | Act I and the Handbook |
| Pro monthly | US$9 / month | Cancel any time |
| Pro yearly | US$72 / year | Shown as "US$6 a month, billed yearly" |
| Classroom | per student per year, set by owner | For teachers and schools: class dashboard, assignments, progress (the teacher mode from the original prompt) |

- **Regional pricing:** support price localisation by country (purchasing power), configured through the payment provider. Show local currency where supported.
- **Student discount:** optional coupon flow, off by default.
- **Free trial:** a `TRIAL_DAYS` config, default 0. The free Act I is the trial.
- **Founding member lifetime offer:** a `FOUNDER_LIFETIME` config, off by default, for the owner to switch on at launch.

### 8.3 Payments implementation

- Build a `PaymentsProvider` interface (`createCheckout`, `createPortalSession`, `handleWebhook`, `getSubscription`) so the provider can change without touching the app.
- Implement one provider. **Recommended default: a merchant-of-record provider (Paddle or Lemon Squeezy)**, because the owner is a solo seller and a merchant of record handles global sales tax and VAT, invoices and chargebacks. Also write a Stripe Billing implementation behind the same interface (Checkout plus Customer Portal plus webhooks), and pick through config. Record the choice in `DECISIONS.md` and leave a clear owner-action note: "Create an account with X, add keys to `.env`."
- **Entitlements table** (`entitlements`: user_id, plan, status [active, trialing, past_due, canceled, expired], current_period_end, provider, provider_customer_id, provider_subscription_id, updated_at). Webhooks are the source of truth. Make webhook handling idempotent (store processed event IDs) and verify signatures.
- **Grace period:** on a failed payment (`past_due`), keep access for 7 days and show one calm banner in Settings, not on every screen.
- **Server-side gating.** Pro content must not ship to free users' browsers. Serve Pro project content, tests, starter files and solutions only through authenticated server routes that check entitlements. The current static content bundle must be split into a free bundle and per-project Pro payloads. Write tests proving a free user gets a 403 for a Pro project's content.
- **Classroom billing:** a teacher buys N seats; students join with a code and get Pro for the seat's duration.
- **Under-18 purchasers:** checkout requires confirming you are 18 or over or have a parent or guardian's permission. Add a "Ask a parent" share link that opens the pricing page with a short plain explanation for parents.

### 8.4 Paywall and pricing UX

- **No mid-lesson paywalls, ever.** The paywall appears in exactly two places: when the learner tries to enter Act II after shipping the Act I capstone, and when they click a locked district or project.
- **The gate scene:** after the Expense Tracker ships, a short cutscene. Mira from the post office asks for help, the High Street district glows, and a `frame-panel` shows what's in Pro with a "Get Pro" button and a "Not now" button. "Not now" returns to the map with no further nagging. Locked districts stay visible with a pixel padlock.
- **Pricing page:** two plan cards drawn as paper tickets (Free and Pro, with a monthly/yearly toggle), then a Classroom line, then the "your work is always yours" promise, a plain FAQ (cancel any time, refunds, what happens to my code, student pricing, schools), and the credit footer. Do not use "Most popular" ribbons, a crossed-out fake "original price" or countdown timers.
- **Billing in Settings:** current plan, renewal date, a "Manage billing" button (opens the provider's portal), invoices, and cancel.
- **Copy:** plain and specific. "Pro unlocks the other eight Acts: 100 more projects, from a Flask web app to a game-playing AI." Not "Unlock your full potential."

### 8.5 Owner actions (list them in `REDESIGN_PLAN.md` and stop only for these)

1. Choose and buy a domain, then set `BRAND.domain`.
2. Create a payments provider account and add keys.
3. Set the final prices and the founder offer.
4. Review the drafted terms, privacy and refund policy pages.

Build everything else with test-mode keys and a sandbox so it all works end to end before the owner does any of this.

---

## 9. Growth basics (so people find it)

### 9.1 The public Python Handbook

- Turn the Concept Index into a **public, free, crawlable reference**: one page per concept ("Python f-strings", "Python list comprehensions", "What is gradient descent"), each with a plain explanation, a runnable example in an embedded mini-editor, common mistakes, and a link to the project that teaches it.
- Server-rendered, fast, with good titles and descriptions, a sitemap and structured data. This is the main source of free traffic from search. Write the first 60 pages for the Act I and Act II concepts during this phase.
- Same visual system as the app.

### 9.2 Sharing

- **Shareable project pages (opt-in):** a shipped project gets a public page with the learner's character, the project name and a runnable version of their code. Every page has an OG image generated from the pixel art ("Otter shipped a Spam Filter in Fixwick").
- **Act certificates (Pro):** a pixel-art certificate per Act with a verification URL, downloadable as PNG and PDF, and shareable to LinkedIn.

### 9.3 Funnel analytics (self-hosted events, already in the schema)

Track these events and build a small owner-only `/admin/metrics` page: visit landing, start the first project as a guest, sign up, ship project 1, ship project 5, ship the Act I capstone, view the paywall, start checkout, subscribe, cancel. Show weekly counts and conversion between steps. No third-party trackers.

---

## 10. Copy rules (updated)

Everything in the original prompt's Section 7.8 copy list still applies, plus:

- No em dashes anywhere. The copy lint must catch them.
- No emoji anywhere. The credit heart is a sprite.
- No eyebrow labels (small uppercase tracked text above a heading).
- Project names are plain. Dialogue carries the character.
- Buttons are verbs: "Run", "Check", "Start the first job", "Get Pro", "Manage billing".
- Extend the copy lint so it fails on: "unlock your", "journey", "level up", "dive in", "seamless", "supercharge", "empower", "elevate", "unleash", "game-changer", "cutting-edge", "Saltmarsh", "Paul's Python Course".

---

## 11. Acceptance checklist

Do not mark the redesign done until every item is true. Check by looking at screenshots, not by assuming.

**Look**
- [ ] No cream or beige background anywhere, in either theme.
- [ ] No serif font anywhere. `grep` the CSS and the built font files to prove it.
- [ ] No uppercase tracked eyebrow labels. `grep` for `text-transform: uppercase` and `letter-spacing` on labels.
- [ ] No 1px grey hairline borders separating regions.
- [ ] No `border-radius` above 0 in the tool UI.
- [ ] No Lucide, Heroicons or similar icon set in the visible UI.
- [ ] No gradients, glows, blurred shadows or `backdrop-filter`.
- [ ] Every button has a visible press state, and locked is distinguishable from disabled.
- [ ] The editor takes at least 60% of the Workbench width at 1440px.
- [ ] No text overflows or overlaps at 1440x900 or 390x844. The Next.js dev indicator is hidden.
- [ ] Pixel art and the pixel font render crisp at every size shown (whole-number scales only).
- [ ] Put the new Workbench screenshot next to a screenshot of Claude.ai. They must look like products from different worlds.

**Characters**
- [ ] Every main character passes the silhouette test at 1x, and the before/after sheets are saved.
- [ ] Moss reads instantly as a tortoise, Pip as a pigeon, Dennis as a rubber duck.
- [ ] Each main character has at least 10 portrait expressions. Each client has at least 6.
- [ ] Portraits change expression with the dialogue and blink.
- [ ] At least 40 reactive lines exist for Act I and fire on real code events.

**Brand**
- [ ] "Fixwick" everywhere. No "Saltmarsh" or "Paul's Python Course" in the built output (test passes).
- [ ] The credit line with the pixel heart shows in the footer and in Settings, with correct alt text.
- [ ] Favicon, OG image and wordmark come from the sprite pipeline.

**Curriculum**
- [ ] Act I rewritten as the 13 real projects, all checks passing (reference solutions pass, starters fail).
- [ ] Every Act I project downloads as a runnable folder with a README.
- [ ] Every later Act has its full project list in content, with at least the first project fully written.

**Money**
- [ ] A free user can complete all of Act I and never sees a paywall before the gate scene.
- [ ] Test-mode checkout works end to end: subscribe, webhook, entitlement active, Act II opens.
- [ ] Cancel works, and after expiry the learner keeps access to their own work.
- [ ] A free user gets a 403 for Pro content from the server.
- [ ] The pricing page and billing settings match Section 8.4.

**Quality**
- [ ] Copy lint passes. axe passes on every page. Lighthouse 90+ on the landing page and a Handbook page.
- [ ] All the original end-to-end tests still pass (sign up, autosave, restore on a new device, Stop, `input()`).
- [ ] `REDESIGN_PLAN.md` and `DECISIONS.md` are up to date, with before and after screenshots of every screen.

Start now: write `REDESIGN_PLAN.md`, then begin Phase R1.
