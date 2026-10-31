# REDESIGN-2.md: new cast, new art direction, better learning screen

Read this whole file before changing anything. It is the second revision brief for the app you have already built from `pauls-python-course-prompt.md` and `REDESIGN.md`.

The owner's verdict on the current build, after seeing every screen: **the characters, the map and the overall UI look bad, and the learning screen isn't good either.** This file fixes that. It also renames the product back to Paul's Python Course and replaces the whole cast.

## How this file relates to the earlier files

- **This file overrides** everything in `REDESIGN.md` about: the name and brand (Section 1), the visual design system (Sections 2 to 4), the Workbench, map and page layouts (Section 5), and the characters and scenes (Section 6). It also replaces the town of Fixwick and all its characters.
- **These parts of `REDESIGN.md` still stand:** the real-project curriculum (Section 7), paid plans and payments (Section 8), the Python Handbook and growth basics (Section 9), the copy rules (Section 10) and the acceptance tests that aren't about the look.
- **Everything else from the original prompt still stands:** the teaching method, step types, hints, Python runtime, checking, architecture, saving, accounts, content format, accessibility and testing.
- Keep everything that works: auth, autosave, Pyodide, `input()`, Stop, checks, snapshots, payments, entitlements, the Handbook, Morning Rounds, Drills, the Shelf, the Arcade League.
- If this file and an earlier one disagree, this file wins.

## Order of work

1. Write `REDESIGN2_PLAN.md` listing what you'll change, in the order below. Keep it updated.
2. **Phase S1: Brand back.** Name, copy, metadata (Section 1).
3. **Phase S2: New design system.** Remove the pixel UI. New type, colour, components (Sections 2 and 3).
4. **Phase S3: The learning screen.** Rebuild the Workbench (Section 4).
5. **Phase S4: The Clocktower.** Replace the town map (Section 5).
6. **Phase S5: The other pages** (Section 6).
7. **Phase S6: The cast.** New characters, art pipeline, artist brief, placeholder art, dialogue rewrite (Sections 7 and 8).
8. Run the acceptance checklist (Section 10) with before and after screenshots of every screen at 1440x900 and 390x844, in dark and light mode.

---

## 1. Name: back to Paul's Python Course

- The product is called **Paul's Python Course** again. Short form, where space is tight: **PPC**.
- Tagline: **"Learn Python by building real things."**
- Description: "Paul's Python Course takes you from your first line of Python to machine learning and reinforcement learning, one real project at a time. A bill splitter, a to-do app, a weather app, a Flask website, a spam filter, a game-playing AI. You write real code in your browser, and everything you build is yours to keep."
- Update `lib/brand.ts`: `name: "Paul's Python Course"`, `shortName: "PPC"`, the new tagline and description. Remove `townName`.
- Remove every mention of **Fixwick**, Moss, Pip, Bea, Captain Ferro, Mira, Agnes, Gwen, Ellie, Nell, Priya Lund, Ines Wendt, Ada Penhallow, Sir Reginald and the Arcade Committee from UI, content, emails, metadata and sprites. The story layer is replaced in Section 7.
- Update the build test: it now fails if the output contains "Fixwick", "Saltmarsh", "Moss" (as a character name), "Pip" (as a character name) or "Penhallow". Be careful: `pip` the Python package installer is fine and must not trip the test. Match the character names in dialogue and UI strings only.
- Remove "Fixwick is made up. The Python is real." from the footer.
- **Credit line** stays: "Made with [pixel heart] by Paul Nercessian". Keep the small red heart sprite, it's one of the few pixel details worth keeping. It still appears in the footer and at the bottom of Settings.
- **Logo:** a new wordmark. "Paul's Python Course" set in the display font (Section 2.2), with a small mark: a simple, well-drawn snake curled into the shape of a "P", in the signature colour. Draw it as a clean SVG, not pixels. Favicon from the mark at 16, 32, 180 and 512 px.

---

## 2. Design system: remove the pixel UI

### 2.1 What's wrong with the current UI

Open every screen and see these for yourself before fixing them.

1. **The pixel font is used for nearly everything:** nav, headings, buttons, labels, tabs, step numbers, dialogue. At these sizes it reads as low resolution and amateur next to crisp body text. It makes the whole product look like a game jam entry.
2. **Every region is wrapped in a 9-slice pixel frame.** Frames inside frames, corner caps that look like rendering glitches, double borders. It's visually noisy and makes every page look the same.
3. **Light mode is washed out:** pale blue ground, a cream ticket, grey panels, with no clear hierarchy.
4. **The map** uses checkerboard dithering on locked areas, which looks like missing textures. Buildings are tiny and hard to read.
5. **Characters have odd anatomy and muddy colour,** and the portraits are crudely cropped. Pixel art drawn by writing pixel grids in code has hit its limit. See Section 8 for the fix.
6. **The Drills page** is a long column of identical rows.
7. **Small UI text is fragmented:** many tiny pixel-font labels ("This step:", "Example run", "Checks you can see") competing for attention.

### 2.2 New direction in one paragraph

Paul's Python Course should look like **a beautifully made code school with illustrated characters**, not like a retro game. The tool UI is crisp, modern and confident: a professional dark code editor at the centre, clean type, strong colour, generous space. The game and the warmth come from **hand-illustrated characters and scenes**, from the building that fills up as you progress, and from small crafted moments (a stamp when you ship, a character reacting to your code). The UI itself is not where the game lives.

Think of the polish of a premium learning product combined with the charm of an illustrated indie game. Reference points for the *feeling* only (do not copy anything): the illustrated warmth of games like Florence, Spiritfarer and Unpacking; the clarity of a good dark code editor; the confidence of well-designed editorial sites. Things it must not look like: Claude.ai, ChatGPT, a generic shadcn/ui dashboard, a Vercel template, a cream-and-serif "tasteful" page, or a pixel-art game jam.

### 2.3 Typography

Remove the pixel font from everything except the credit heart (which is an image, not text).

- **Display font:** **Bricolage Grotesque** (SIL OFL, self-hosted, variable). Use it for page titles, the wordmark, project titles, character names and big numbers. Weights 600 to 800. Use its optical size axis: larger sizes get the tighter, quirkier cut. Tight letter-spacing at large sizes (-0.02em). This font gives personality without being a cliché.
- **Text font:** **Atkinson Hyperlegible Next** (keep it). Body 17px desktop / 16px phone, line height 1.55, 400 and 700 only. Use it for all UI text too: buttons, tabs, labels, nav, at 14 to 15px, weight 700 for buttons.
- **Code font:** **JetBrains Mono** (keep it). 15px in the editor.
- **Type scale** (desktop): 14, 15, 17, 20, 24, 32, 44, 60. Phone: 14, 15, 16, 18, 22, 28, 36, 44.
- **No small uppercase tracked labels.** No italic emphasis in headings. Labels are sentence case, 14px, weight 700, in the secondary text colour.

### 2.4 Colour

Delete the night and day palettes from `REDESIGN.md` and rebuild `tokens.css`.

**Signature colour:** **Python yellow-orange**, `--sun: #FFB627`, with `--sun-ink: #2A1E00` for text on it. Use it for the primary action, the current step, focus rings and highlights. It nods to the Python logo's yellow without copying the logo.

**Second accent:** **deep Python blue**, `--blue: #3B6FD8` (lighter `#7FA6F0` for text on dark). Links, info, selected states.

**Dark theme (default):**

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0F1115` | page background |
| `--surface-1` | `#161920` | panels |
| `--surface-2` | `#1D212A` | raised panels, cards |
| `--surface-3` | `#272C37` | hover, inputs |
| `--line` | `#2E3441` | the only border colour, used sparingly |
| `--text` | `#F2F3F5` | primary text |
| `--text-2` | `#A4ABB8` | secondary text |
| `--text-3` | `#6E7584` | tertiary, placeholders |
| `--editor` | `#12141A` | editor background |

**Light theme:**

| Token | Hex |
|---|---|
| `--bg` | `#F6F7F9` |
| `--surface-1` | `#FFFFFF` |
| `--surface-2` | `#FFFFFF` |
| `--surface-3` | `#EEF0F4` |
| `--line` | `#DDE1E8` |
| `--text` | `#14171D` |
| `--text-2` | `#4F5665` |
| `--text-3` | `#7D8493` |
| `--editor` | `#FFFFFF` |

No cream, no beige, no pale blue page backgrounds. Light mode is clean white and cool grey.

**Status colours** (both themes, adjusted for contrast): pass `#2FBF71`, fail `#F2545B`, warning `#FFB627` (same as sun). Always paired with an icon or text.

**Character colours:** each character has one signature colour (Section 7). These appear on their name tags, speech bubble accents and their floor of the Clocktower. They add variety without breaking the system.

**Still banned:** purple-to-pink or blue-to-purple gradients, gradient text, glows, glassmorphism and `backdrop-filter`, neon.

### 2.5 Shape, depth and borders

- **Corner radius:** 8px for cards and panels, 6px for buttons and inputs, 4px for inline code and badges. Consistent everywhere. No pill-shaped buttons.
- **Borders:** use `--line` at 1px only where two similar surfaces meet. Most separation comes from surface steps and space. Never box every region.
- **Depth:** one shadow token for floating things (menus, dialogs, the coach bubble): `0 8px 24px rgba(0,0,0,0.28)` in dark, `0 8px 24px rgba(20,23,29,0.10)` in light. Nothing else casts a shadow.
- **No 9-slice frames, no pixel borders, no corner caps.** Delete the frame sprites and the `border-image` CSS.

### 2.6 Icons

- Use **one consistent, well-made icon set at 20px, 1.75px stroke, rounded joins**. Phosphor Icons (MIT) in its "regular" weight is the choice. It is less overused than Lucide and has more personality.
- Icons only where they help: run, check, stop, hint, history, reset, settings, map, shelf, lock, download, GitHub. Never decorative.

### 2.7 Motion

- 150 to 200 ms ease-out for UI transitions. Springy (but subtle) for the coach bubble appearing and the ship stamp.
- Characters in illustrations can have small idle animations (blink, breathing) if the art supports it.
- Still banned: fade-up-on-scroll for every block, hover lift on every card, bouncing buttons, parallax.
- `prefers-reduced-motion` turns all of it off.

---

## 3. Components

Rebuild every shared component on the new tokens. Delete old component CSS once replaced.

- **Buttons:** 40px tall (44px on phone), 6px radius, 15px weight-700 text, optional 20px icon. Variants:
  - `primary`: sun background, sun-ink text. One per screen region.
  - `secondary`: surface-3 background, text colour.
  - `ghost`: transparent, text-2 colour, surface-3 on hover. For tertiary actions like Reset.
  - `run`: pass green background, dark text, play icon. Only for Run.
  - `danger`: fail red.
  - Pressed: 1px down plus a slightly darker fill. Focus: a 2px sun ring with 2px offset.
  - Locked: secondary style with a lock icon and a tooltip explaining why. Disabled: 40% opacity.
- **Tabs:** text tabs with a 2px sun underline on the selected tab. A count badge where useful ("Checks 3/5").
- **Cards:** surface-2, 8px radius, 20 to 24px padding, no border in dark mode, a 1px line border in light mode.
- **Inputs:** surface-3, 6px radius, 1px line border, sun focus ring.
- **Badges:** 4px radius, 13px weight 700. "Free", "Pro", "Shipped", "In progress".
- **Toasts:** bottom centre, surface-2 with the floating shadow, an icon, one line, auto-dismiss.
- **Speech bubble** (used by the coach, Section 4.4): surface-2, 8px radius, a small tail pointing at the character, and a small name tag in the character's colour above the text. Do not use a coloured left edge: that "callout with a left bar" is a known AI tell.
- **Editor theme:** rebuild `ppc-dark` and `ppc-light` CodeMirror themes from the new tokens. Syntax: keywords blue-light, strings `#8FD18A`, numbers sun, comments text-3 (not italic), functions text bold, builtins `#F29E6D`. Check contrast.
- **Error panel:** shown under a traceback in the console. A short heading in the display font ("A number is still text"), the explanation in the text font, and a "Go to line 4" secondary button. Neil's small portrait (48px) beside the heading, since he handles debugging (Section 7).

---

## 4. The learning screen (Workbench), rebuilt

The current Workbench problems: the brief is crammed into a narrow column, the step numbers (1 to 12) mean nothing, the console is a large empty box, the bottom dialogue bar wastes about 100px on narration ("Rain on the window..."), the hint and duck buttons are tiny, and the important thing (what to do right now) is buried halfway down the ticket.

### 4.1 Layout (desktop)

```
+--------------------------------------------------------------------------------------+
| [logo] Paul's Python Course   Act 1 / Bill Splitter              [saved] [map] [me]  |
+--------------------------------------------------------------------------------------+
| Predict  >  Investigate  >  Example  >  [ Fix Caitlin's version ]  >  Build  >  Ship |
+------------------------------------+-------------------------------------------------+
| INSTRUCTIONS (400px)               |  main.py                      [Run] [Check] [..]|
|                                    |                                                 |
|  Fix Caitlin's version             |                                                 |
|  (step title, display font, 28px)  |              EDITOR                             |
|                                    |                                                 |
|  What to do, in 2 to 4 short       |                                                 |
|  paragraphs.                       |                                                 |
|                                    |                                                 |
|  [coach: Neil portrait + bubble]   |                                                 |
|  [Hint] [Explain it to the duck]   |-------------------------------------------------|
|                                    |  Output   Checks 0/5                    [v]     |
|  > Project spec (collapsed)        |  (console, collapsed until you Run)             |
|  > Checks you can see (collapsed)  |                                                 |
+------------------------------------+-------------------------------------------------+
```

### 4.2 Step bar

- Replace the numbered dots with **named steps**: "Predict", "Investigate", "Example", "Fix Caitlin's version", "Build", "Ship". The step names come from the content files.
- Done steps get a check icon and text-2 colour. The current step is a sun-coloured pill with sun-ink text. Future steps are text-3. Steps are clickable once visited.
- If the names don't fit, earlier done steps collapse into "3 done" with a popover.
- The project's position in the Act ("Project 2 of 13") goes in the header breadcrumb, never in the step bar. Never show two different numbering systems side by side.

### 4.3 Instructions panel (left, 400px, resizable 340 to 520px, collapsible)

Order, top to bottom:
1. **Step title** in the display font, 28px. This is the most prominent text in the panel.
2. **What to do**, in the text font, 17px. Two to four short paragraphs. Inline code styled properly.
3. **The coach** (Section 4.4).
4. **Hint** (secondary button, lamp icon) and **Explain it to the duck** (ghost button, duck icon).
5. **Project spec**, collapsed by default after the Ask step: what the program does and the example run in a code block. One click to expand. It never pushes the step instructions down.
6. **Checks you can see**, collapsed by default: the visible test cases as compact input/expected pairs. "Plus 5 hidden checks" as one line under them.
7. On Predict steps, the answer options appear here as large, clearly selectable cards, with a "Lock in my answer" primary button.

No paper ticket, no pin, no torn edge, no cream colour.

### 4.4 The coach

The characters live in the learning screen through a small **coach** in the instructions panel, not a full-width bottom bar.

- A circular 64px portrait of the character speaking (Paul, Neil, or a classmate), their name tag in their signature colour, and a speech bubble with one or two short lines.
- It appears when there's something worth saying: the start of a step, a failed check (after the second fail), a passed check, a hint, a reactive comment on the code (Section 7.4). It does not narrate weather or scenery.
- Clicking the portrait shows the previous lines for this step.
- "Less talk" setting: the coach only appears for hints and errors.
- **Delete the bottom dialogue bar** from the Workbench entirely.

### 4.5 Editor and console

- The editor takes all remaining width. Run (run variant) and Check (primary) at the top right of the editor. Reset, History and Keys go in the "..." menu.
- **Console:** collapsed to a 40px bar ("Output", "Checks 0/5") until the first Run or Check, then it opens to 35% height. Resizable. It remembers its size.
- `input()` stays inline in the console with a blinking cursor.
- **Check results** open in the Checks tab automatically. Header: "3 of 5 checks passed" with a progress bar in pass and fail colours. The first failing check is expanded, showing input, expected and got side by side, with differences highlighted character by character.
- When all checks pass: the step bar's current pill turns green with a check, and the coach says one line. A "Next step" primary button appears in the editor toolbar where Check was.

### 4.6 Ask and Ship moments

- **Ask:** a full-width panel replaces the Workbench for the first step of a project. On the left, a large illustration (the classmate who needs the project, half-body, at least 360px tall, from the art in Section 8). On the right, their request in two to four speech bubbles, then the project spec card, then "Start building" (primary). Skippable. Replayable from the spec.
- **Ship:** after the Build step passes, a panel shows the finished program running in a nice "demo" frame (for example the bill splitter's output on a phone mockup drawn as a simple illustration), the classmate's reaction illustration and line, a "Shipped" stamp animation, and two buttons: "Add to my Shelf" (primary) and "Download the project" (secondary).
- These are the only places on the learning path with large illustrations. The rest of the Workbench is for work.

### 4.7 Phone

- Header stays. Step bar becomes a horizontal scroller with the current step centred.
- Three tabs: "Instructions", "Code", "Output". The coach shows at the top of Instructions.
- Run and Check stay pinned at the bottom of the Code tab as a 56px bar.

---

## 5. The Clocktower (replaces the town map)

The town map is replaced with a single illustrated building: **the Clocktower**, an old brick clocktower that Paul has turned into a code school. It's shown as a **cross-section**, like a dollhouse: you see every floor at once. Each floor is an Act. This is simpler to read than a town map, much easier to make beautiful, and it fills up visibly as you progress.

### 5.1 Floors

From the bottom up:

| Floor | Act | Room | Character who lives there |
|---|---|---|---|
| Ground | I. Foundations (free) | The Workshop: Paul's classroom, a big desk, a chalkboard, the duck | Paul |
| 1 | II. Fluent Python | The Studio: desks, shelves of notebooks, a kettle | Neil |
| 2 | III. Real-World Python | The Makerspace: a soldering bench, a small arcade cabinet, a server under the desk | Caitlin |
| 3 | IV. Algorithms | The Puzzle Room: a giant wall of sticky notes and string, a chess table | Yahya |
| 4 | V. Data Science | The Archive: filing cabinets, a huge wall chart, a weather station outside the window | Aaesha |
| 5 | VI. Machine Learning | The Model Room: whiteboards full of graphs, a coffee machine | Riya |
| 6 | VII. Deep Learning | The Engine Room: the clock's gears behind glass, a rack of glowing servers | Aaesha and Neil |
| 7 | VIII. Reinforcement Learning | The Arcade: a row of cabinets, a leaderboard, prize shelf | Yahya and Caitlin |
| Roof | IX. Capstones | The Clock Face and Roof Terrace: the city skyline at night, string lights | everyone |

### 5.2 How it looks and behaves

- One large illustration, drawn as a set of floor layers so each can change state. Each floor has three states: **locked** (dark, the room's furniture under dust sheets, a small lock badge on the floor's label), **open** (lights on, furniture uncovered), and **busy** (the resident character visible and doing something, more props, plants grown). A floor becomes busy when about half its projects are shipped.
- **No checkerboard dithering, no texture noise for locked floors.** Locked means dark and covered, drawn deliberately.
- Hovering a floor highlights it and shows a label: "Floor 2: Real-World Python. 3 of 10 shipped."
- Clicking a floor opens a **side sheet** listing the floor's projects as cards: project name (display font), one line on what it does, estimated time, status badge, and a small icon of the project's Shelf object. Locked Pro floors show the full project list with a "Pro" badge and a "Get Pro" button at the bottom of the sheet.
- Next to the tower (desktop) or under it (phone): three cards for **Continue** (the exact project and step, with a "Back to your desk" primary button), **Morning Rounds** (cards due, about how many minutes, "Start"), and **Shelf** (how many things you've made, "Open the Shelf").
- The page title is "The Clocktower" with one line of progress: "7 projects shipped. 2 floors open."
- Night and day versions of the illustration follow the theme (lit windows at night, daylight through windows by day). If the artist can only deliver one version, use the night version in both themes.
- **List view** toggle for accessibility and for anyone who prefers it: a clean table of Acts and projects.

### 5.3 Until the real art arrives

Build the Clocktower as an SVG layout now with **placeholder art that is deliberately simple and good-looking**, not an attempt at detail: each floor a clean rectangle in its character's signature colour (muted for locked, full for open), with a simple line icon for the room (a chalkboard, a kettle, a gear) and the floor label. A flat, geometric, well-spaced placeholder looks intentional. A detailed but clumsy one looks broken. Structure the component so each floor's art is a swappable image layer with three states.

---

## 6. The other pages

Apply the new design system to every page. Specific fixes:

- **Landing page:**
  - Hero: on the left, the wordmark, the tagline as the main headline (display font, 60px), the description (text-2, 20px) and two buttons ("Start the first project, free" primary, "See all 116 projects" secondary). On the right, the **class illustration**: Paul at a chalkboard, Neil leaning on a desk, the four classmates at their laptops (from the art in Section 8). Until it exists, show the live playable Workbench in a clean browser-window frame on the right instead. No pixel harbour scene.
  - "Try it now": the playable first project in a cut-down Workbench, full width.
  - "What you'll build": a grid of real project cards with a real screenshot or output sample of each (the bill splitter's terminal output, the weather app's forecast, the Flask app's page, the spam filter's confusion matrix, the Snake game). These are real artefacts, not illustrations. Use cards of different sizes in an asymmetric grid, not a uniform 3x3.
  - "Meet the class": the six characters, each with a portrait, name, role and one line in their voice.
  - "The Clocktower": the tower illustration with what each floor teaches.
  - Pricing, FAQ, footer with the credit line.
- **Syllabus:** keep the content. Restyle: Act headers in the display font with the floor's character colour as a small square marker, project rows as clean list items with number, name, one-line description and concept tags as small badges.
- **Pricing:** two clean cards (Free and Pro) side by side, with the Pro card in a sun-coloured 2px outline. No cream tickets. Keep the copy and the "your work is always yours" promise.
- **Handbook pages:** the display font for titles, the text font at 18px for explanations, the runnable example in a proper editor card. Remove the pixel "strength" bar and use a small text badge ("Not met yet", "Getting there", "Solid").
- **Morning Rounds:** one card at a time, centred, max 720px wide. The card shows the project it relates to (small icon and name), the task, a mini editor and "Check". Progress as "3 of 10" text plus a thin progress bar. The coach speaks once at the start (Paul: "Ten quick ones before anything new.").
- **Drills:** replace the long list with a grid of topic cards grouped under Act headings. Each card: topic name, best time (or "No time yet"), the classmate rival's time (Yahya, Section 7), and a "Start" button. Locked topics in a collapsed "Not unlocked yet (65)" group.
- **Shelf:** a grid of project cards, each showing a real preview of the program's output (a rendered snippet of terminal output or a chart thumbnail), the project name, the date shipped, and buttons to Run, Download and Push to GitHub. A large "Export everything as a repository" button at the top. Drop the pixel shelves.
- **Settings:** clean grouped sections with headings, no frames. Character section shows the learner's avatar (Section 7.3). Credit line at the bottom.
- **Character creation:** replaced by avatar creation (Section 7.3).
- **Paywall gate:** a centred card with the illustration of the floor that's locked, the project name, a short explanation, "Get Pro" and "Not now". Not a bare frame on an empty page.
- **Arcade League:** keep the logic. Restyle the grid with clean cells, character-coloured tiles, and a proper crab icon.

---

## 7. The cast

The cast is six people. All characters are humans. They are named after real people the owner knows.

### 7.1 Roles

| Character | Role | Signature colour | Where they live |
|---|---|---|---|
| **Paul** | The main professor. Runs the course. | Sun yellow `#FFB627` | Ground floor, the Workshop |
| **Neil** | The sub professor (teaching assistant). Hints and debugging. | Teal `#1FB5A8` | Floor 1, the Studio |
| **Aaesha** | Classmate. Data and tests. | Coral `#FF7A6B` | Floor 4, the Archive |
| **Caitlin** | Classmate. Games, web and making things. | Violet `#8C6BF2` (as a flat colour only, never in a gradient) | Floor 2, the Makerspace |
| **Riya** | Classmate. Practical projects and ML. | Leaf green `#4CC36F` | Floor 5, the Model Room |
| **Yahya** | Classmate. Algorithms, speed and the arcade. | Blue `#3B6FD8` | Floor 3, the Puzzle Room |

### 7.2 Who they are and how they talk

The voice rules from the original prompt still apply to everyone: short lines (mostly under 20 words), at most one exclamation mark per project across all dialogue, no emoji, no em dashes, no fourth-wall talk about AI or "your learning journey", and no generic praise. Praise is specific ("Your names say what they hold. That's half of good code.").

**These are real people.** Write them warmly and respectfully. Nobody is the butt of the joke. Every character makes mistakes sometimes and every character is good at something. Never base personality, voice or appearance on assumptions about anyone's name, background or culture.

**Paul, the main professor**
- **Role in the product:** introduces each Act and project, gives the worked examples, reviews code at the end of each project, and runs Morning Rounds.
- **Personality:** calm, sharp and funny in a dry way. High standards, delivered kindly. Believes the fastest way to learn is to build something real and break it. Obsessed with good variable names and readable code.
- **Voice:** "Build it ugly first. Then make it good." / "Read the error from the bottom. The last line is where it hurt." / "That works. Now make it so the next person can read it."
- **Running thread:** he keeps promising to fix the Clocktower's actual clock, which has been stuck at 3:14 for years. In the final Act, with the learner's help, it finally runs.

**Neil, the sub professor**
- **Role in the product:** gives the three hint levels (Nudge, Plan, Shape), explains errors, and owns "Explain it to the duck" (the duck lives on his desk).
- **Personality:** energetic and approachable, the one you ask when you're stuck. Explains things a second way when the first one didn't land. Loves a good bug hunt.
- **Voice:** "Okay. What did you expect it to print? What did it actually print?" / "Close. Look at line 4 again." / "Every programmer has written this exact bug. Including Paul."
- **Running thread:** he and Paul disagree, good-naturedly, about whether tabs or spaces matter (they do: Python uses four spaces, and Neil eventually admits Paul was right).

**Aaesha, classmate**
- **Role:** brings data projects, and from Act II onward is the one who writes tests first. Leads the data and deep learning floors.
- **Personality:** precise, organised, quietly funny. Hates duplicated data and charts that lie.
- **Voice:** "Before you run it, how will you know it worked?" / "That chart starts at 40. It's lying to you."

**Caitlin, classmate**
- **Role:** brings games, web apps and creative projects. Leads the Makerspace and co-runs the Arcade.
- **Personality:** creative, fast, impatient, builds the fun version first. Gets bored by anything without a screen.
- **Voice:** "Can it have a high score?" / "It works. It's ugly. Shipping it."

**Riya, classmate**
- **Role:** brings practical, real-life projects (a bill splitter, an expense tracker, a website for a small business), and leads the machine learning floor.
- **Personality:** practical and entrepreneurial. Always asks what something is for. Good at explaining things simply.
- **Voice:** "Who's actually going to use this?" / "My model's 99% accurate. Wait. That's suspicious."

**Yahya, classmate**
- **Role:** brings algorithm puzzles, sets Drill times as the learner's rival, and runs the Arcade League on the RL floor.
- **Personality:** competitive, quick, a good sport. Loves elegant solutions and hates slow code.
- **Voice:** "Mine runs in 0.02 seconds. Yours?" / "That's O(n squared). We can do better."

**The "Fix the classmate's version" step** (was "Pip's Version"): rotate it between the four classmates. Each one makes mistakes that match their personality: Caitlin skips edge cases because she ships fast, Yahya over-optimises before it works, Riya overfits a model, Aaesha's code is correct but her test has a typo. The tone is always friendly ("Can you look at mine? Something's off."), never mocking.

**The duck:** a yellow rubber duck with a chipped beak on Neil's desk. Unnamed, never speaks. Clicking it opens "Explain it to the duck".

### 7.3 The learner's avatar

- Replace the animal species picker. The learner builds a **human avatar** in the same illustrated style as the cast, from layered parts: face shape, skin tone (a wide, inclusive range of at least 12), hair style (at least 16, including covered options such as a hijab, a turban and a beanie), hair colour, eyebrows, glasses or not, facial hair or not, top (hoodie, jumper, shirt, jacket), top colour, and an accessory (headphones, cap, scarf, none).
- Until the illustrated parts exist, use a simple, good-looking placeholder: a circular avatar with the learner's initials on a colour they choose.
- The avatar appears in the header, on the Shelf and on public project pages.

### 7.4 Reactive dialogue

Keep the reactive-line system and rewrite every line for the new cast. At least 60 lines for Act I across Paul, Neil and the classmates, triggered by real events (first f-string, a loop that never runs, a variable called `x` holding a price, first-try pass, third failed attempt, a very long function, a good name, returning after a break). Never repeat a line from the last 30 shown to a user.

### 7.5 Projects move to the new cast

Reassign every project's client in the content files. Examples for Act I:
- Shop Sign → **Course Sign** for Paul (the sign on the Clocktower door).
- Bill Splitter → for Riya (splitting the bill after the class dinner).
- Reading Tracebacks → for Neil (five broken scripts from his old projects).
- Unit Converter → for Yahya (converting his running times and distances).
- Password Checker → for Aaesha (rules for the class's shared accounts).
- Times Table Trainer → for Riya's younger cousin (she's tutoring him).
- Number Guessing Game → for Caitlin.
- To-Do List → for Neil.
- Contact Book → for Aaesha.
- Grade Calculator → for Paul (marking the class's first test).
- Rock Paper Scissors → for Caitlin and Yahya (to settle an argument).
- Four-Function Calculator → for Riya.
- Expense Tracker (capstone) → for the whole class (a shared fund for the end-of-term trip).

Do the same for every later Act, following the floor owners in Section 5.1. Keep each project's plain name, concepts, steps and tests. Only the client, the dialogue and the story context change.

---

## 8. Art: how to make the characters genuinely beautiful

### 8.1 The honest constraint

Drawing pixel grids in code produced the current characters, and they aren't good enough. Beautiful, expressive human characters need a skilled human illustrator. Do not try to fix this by drawing more detailed pixel grids, by tracing shapes in SVG paths by hand, or with AI image generation (the owner doesn't want an AI-generated look, and AI art is inconsistent across poses).

So the plan has three parts:
1. **Write a professional artist brief** the owner can send to an illustrator (Section 8.3).
2. **Build the art pipeline** so the finished art drops straight in (Section 8.4).
3. **Ship tasteful placeholders** so the product looks intentional until then (Section 8.5).

### 8.2 The art style

- **2D hand-drawn illustration.** Clean, confident linework with slight line weight variation. Flat colour with one shadow tone and an occasional soft highlight. Warm, slightly muted palette that harmonises with the UI tokens.
- **Semi-realistic, stylised proportions:** about 6.5 to 7 heads tall for full body. Not chibi, not anime, not 3D, not vector "corporate people" (like Humaaans or Open Peeps).
- **Faces carry the charm:** expressive eyes and eyebrows, distinct face shapes and hairstyles so each character is recognisable in silhouette and at 48px.
- **Clothing tells you who they are:** follow the appearance sheet in Section 8.6. Each character has an everyday outfit and an optional matching school-uniform outfit (pale grey-blue short-sleeved shirt) for the group illustration.
- **Consistent across the cast:** same line weight, same shading approach, same light direction (top left), same palette family.

### 8.3 The artist brief

Create `art/ARTIST_BRIEF.md`, written for a professional freelance illustrator who has never seen the project. Include:

1. **The project in three sentences** and a link placeholder to the live site.
2. **The style** (Section 8.2), plus a "please avoid" list: chibi, anime eyes, 3D rendering, corporate vector people, gradients, glossy highlights.
3. **The cast** with role, personality and appearance for each (Section 7.2 plus the appearance sheet in Section 8.6).
4. **Deliverables:**
   - For each of the six characters:
     - **Half-body portrait** in 10 expressions: neutral, talking (mouth open), pleased, proud, thinking, confused, worried, surprised, laughing, unimpressed.
     - **Full-body standing pose**, one per character, plus one action pose that fits them (Paul at a chalkboard, Neil pointing at a screen, Aaesha with a clipboard, Caitlin holding a game controller, Riya with a laptop, Yahya with a stopwatch).
   - **Group illustration** for the landing page: the whole class in the Workshop.
   - **The Clocktower cross-section**, 9 floors, each floor as a separate layer in three states (locked, open, busy), night version required, day version optional.
   - **Avatar parts** for the learner (Section 7.3), on the same base body as the cast.
   - **Shelf objects:** one small icon per project for Act I (13), in the same style.
   - **The duck.**
5. **Technical specs:**
   - Portraits: 1024x1024 canvas, transparent background, character centred with a consistent head position and eye line across all characters (provide a template).
   - Full body: 1024x2048 canvas, transparent.
   - Clocktower: 2400x4000 master, each floor on its own layer.
   - Files: layered source (PSD, Procreate or Clip Studio) plus exported PNGs at the master size. SVG welcome if the style allows.
   - Naming: `paul_portrait_pleased.png`, `clocktower_floor3_open.png` and so on, matching the manifest (Section 8.4).
6. **Licence:** full commercial rights for use in a paid web product, its marketing and merchandise. Credited in the app's Credits page under the artist's name.
7. **Milestones:** first a style sketch of Paul and one other character for approval, then all portraits, then the rest.

### 8.4 The art pipeline

- `art/manifest.json` lists every required image: id, file name, size, character, expression or state, and status (`placeholder` or `final`).
- An `<Art id="paul.portrait.pleased" />` component loads the final image if it exists, otherwise the placeholder. Use Next.js image optimisation to generate WebP and AVIF at the display sizes (64, 128, 256, 512 px for portraits) with correct `srcset`.
- A development page `/dev/art` shows every manifest entry, its status, and how it looks at every display size in dark and light themes.
- A script `scripts/check-art.ts` reports which images are still placeholders and fails if a final image has the wrong size or a non-transparent background where transparency is required.
- Document the process for adding the artist's files in `art/README.md`: drop the PNGs into `art/final/`, run the script, done.

### 8.5 Placeholders, done well

Until the artist's work arrives, the product must still look good. Placeholders must look **deliberately simple**, not like failed attempts at detail.

- **Character placeholders:** a clean circle (for portraits) or rounded rectangle (for larger slots) in the character's signature colour, with their initial in the display font in white or sun-ink, and their name below where space allows. Expressions are not faked. The speech bubble carries the emotion.
- **Clocktower placeholder:** as in Section 5.3.
- **Group illustration placeholder:** use the live Workbench in a browser frame instead (Section 6).
- **Shelf object placeholders:** a Phosphor icon that matches the project (a calculator icon for the calculator), centred in a colour tile.
- **Delete all existing pixel character sprites, pixel scenes and pixel frames** once the placeholders are in. Keep only the credit heart. Remove the sprite-grid build pipeline if nothing else uses it.

### 8.6 Appearance sheet

The characters are based on real people. The owner has described all six from photos. Create `art/CAST_APPEARANCE.md` with the details below and copy them into the artist brief.

All six are young adults (late teens to about twenty), drawn as they are: friendly, natural, not idealised into models and not caricatured. Keep proportions true to the style in Section 8.2. Never exaggerate or comment on body shape.

**Paul** (main professor)
- **Hair:** thick, dark-brown hair, wavy to curly, medium length (down to about the jaw and ears), with volume at the sides and loose waves falling over the forehead. His most recognisable feature.
- **Face:** strong dark eyebrows, brown eyes, light beard stubble and a thin moustache. A big, open grin when he's pleased, an easy half-smile otherwise.
- **Skin:** light, warm olive.
- **Glasses:** no.
- **Everyday outfit:** a navy-and-cream varsity jacket (navy body, cream sleeves) over a collared shirt, or a white polo shirt with black trousers. A black smartwatch.
- **Distinctive detail:** the wavy hair. In the "thinking" expression he pushes a hand through it. For the final scene (the clock running again), a small gold paper crown.

**Neil** (sub professor)
- **Hair:** short black hair, a little longer and swept up at the front.
- **Face:** thick dark eyebrows, brown eyes, clean-shaven, a wide, friendly smile.
- **Skin:** light-medium, warm.
- **Glasses:** yes, **clear or light-grey transparent frames**, slightly rectangular. His signature.
- **Everyday outfit:** a white collared shirt, sleeves sometimes rolled up.
- **Distinctive detail:** the clear glasses, which he pushes up his nose when debugging.

**Aaesha** (classmate)
- **Hair:** very long, straight, dark-brown to near-black hair with a centre parting, falling well past the shoulders, often with a few strands framing her face.
- **Face:** defined dark eyebrows, dark-brown eyes, rosy cheeks, a warm closed-mouth smile.
- **Skin:** light, warm.
- **Glasses:** no.
- **Jewellery:** small gold earrings, a fine gold necklace, a gold bangle.
- **Everyday outfit:** a fitted dark-brown T-shirt and blue denim.
- **Distinctive detail:** the gold jewellery and the warm smile.

**Caitlin** (classmate)
- **Hair:** long dark-brown hair with lighter caramel-brown ends, centre parting, straight with a soft wave, past the shoulders.
- **Face:** dark-brown eyes, a calm, slightly knowing closed-mouth smile.
- **Skin:** medium-brown, warm.
- **Glasses:** yes, **round thin frames in a warm brown or tortoiseshell**. Her signature.
- **Everyday outfit:** relaxed and casual. Default to a loose overshirt over a plain T-shirt, unless the owner says otherwise.
- **Distinctive detail:** the round glasses and the two-tone hair.

**Riya** (classmate)
- **Hair:** long, straight, glossy jet-black hair with a sharp centre parting, falling past the shoulders.
- **Face:** strong, well-defined dark eyebrows, dark-brown eyes, a playful closed-mouth smile.
- **Skin:** light-medium, warm.
- **Glasses:** no.
- **Everyday outfit:** a cream varsity jacket with navy stripes on the collar and cuffs, over a dark top. Pastel lilac nails.
- **Distinctive detail:** the varsity jacket, and a "finger heart" gesture in her "pleased" expression.

**Yahya** (classmate)
- **Hair:** dark, almost black, short tight curls piled on top, with shorter sides.
- **Face:** dark eyebrows, dark-brown eyes, light stubble and a faint moustache. A cool, unbothered look by default. His smile is rare and earned, which suits his competitive streak.
- **Skin:** light-medium, warm olive.
- **Glasses:** no.
- **Everyday outfit:** a black jacket over a heather-grey T-shirt.
- **Distinctive detail:** the curly top and the deadpan expression. In his "proud" expression he throws a peace sign.

**Rules**
- **Do not commit any reference photos to the repository** (it may become public). The owner will send the photos to the artist directly. The file contains only these written descriptions.
- At the top of the file, add: "These characters are based on real people. Check that each person is happy to appear in a paid product, and let them see their character before launch."
- If the owner updates a description, the brief and manifest follow it.

---

## 9. Copy updates

- Update all copy for the new name and cast. "Moss's workshop" becomes "the Workshop", "townsfolk" becomes "classmates", "fixing a town" becomes "building real things".
- Keep the copy lint from `REDESIGN.md` and add: "Fixwick", "townsfolk", "Penhallow", and the old character names (in UI and dialogue strings only).
- Keep: no em dashes, no emoji, no exclamation marks in UI copy, sentence case everywhere, buttons are verbs.

---

## 10. Acceptance checklist

Do not mark this done until every item is true. Check by looking at screenshots.

**Brand**
- [ ] "Paul's Python Course" everywhere. No "Fixwick" or old character names in built UI or content (test passes, and `pip` the tool still appears where it should).
- [ ] New wordmark, snake-P mark and favicon.
- [ ] Credit line with the heart in the footer and Settings.

**Design system**
- [ ] No pixel font anywhere (`grep` the CSS and font files).
- [ ] No 9-slice frames, `border-image`, pixel borders or corner caps.
- [ ] No cream, beige or pale-blue page backgrounds in either theme.
- [ ] One radius scale (8, 6, 4) used consistently.
- [ ] One icon set (Phosphor), no mixing.
- [ ] Light mode has clear hierarchy and contrast.

**Learning screen**
- [ ] Named steps in the step bar, no bare numbers, and only one numbering system visible.
- [ ] The current step's title and instructions are the first thing in the left panel.
- [ ] The spec and visible checks are collapsible and collapsed by default after the Ask step.
- [ ] No bottom dialogue bar. The coach appears in the left panel only when there's something worth saying.
- [ ] The console stays collapsed until the first Run or Check.
- [ ] Check results show differences highlighted.
- [ ] Ask and Ship use the large illustration slots (placeholders for now).
- [ ] Works at 390px with the three-tab layout and the pinned Run/Check bar.

**Clocktower**
- [ ] Replaces the town map, with 9 floors, three states each, and swappable art layers.
- [ ] No dithering or noise for locked floors.
- [ ] Side sheet with project cards, and the Continue, Morning Rounds and Shelf cards.
- [ ] List view works.

**Cast and art**
- [ ] All content reassigned to Paul, Neil, Aaesha, Caitlin, Riya and Yahya, with project names unchanged.
- [ ] At least 60 reactive lines for Act I in the new voices.
- [ ] The classmate "fix my version" step rotates between the four classmates and is always friendly.
- [ ] `art/ARTIST_BRIEF.md`, `art/CAST_APPEARANCE.md`, `art/manifest.json`, `art/README.md` and the `/dev/art` page exist.
- [ ] Placeholders are clean colour-and-initial designs, with no faked faces.
- [ ] All old pixel sprites and scenes removed (except the heart).
- [ ] Avatar creation is human, inclusive, and uses initials placeholders until the art arrives.

**Everything else still works**
- [ ] Sign up, autosave, restore on another device, Stop, `input()`, checks, payments in test mode, the paywall gate, the Handbook, Morning Rounds, Drills, the Shelf, export, the Arcade League.
- [ ] Copy lint, axe and Lighthouse (90+ on the landing page) pass.
- [ ] `REDESIGN2_PLAN.md` and `DECISIONS.md` are up to date, with before and after screenshots of every screen.

Start now: write `REDESIGN2_PLAN.md`, then begin Phase S1.
