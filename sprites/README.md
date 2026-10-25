# Sprites

Every pixel in Fixwick, the town and the interface alike, is a character in a text file in `sprites/src`. `npm run sprites` (also run by `npm run dev` and `npm run build`) turns them into PNG sheets in `public/sprites`. This file is written so that a pixel artist can follow it, including one who would rather draw in Aseprite (see the last section).

## Editing a sprite

Open the `.txt` file, find the frame, change characters, save, and run:

```
npm run sprites -- --preview
```

`--preview` also writes enlarged copies to `sprites/preview/` (one file per sprite, plus `-sheet.png` with every frame) so you can look at your change. That folder is not committed. In development, `/dev/sprites` shows every sprite and expression at 1x, 3x and as a silhouette, on night and day backgrounds.

## The palette

One palette serves the pixel art and the interface, so the game and the tool look like one product. Each character in a grid is one pixel; `.` is transparent; every other character must be a colour from `palette.json` (the build refuses anything else).

The world, kept desaturated so characters stand out against it:

| | | | | | |
|---|---|---|---|---|---|
| `0` harbour night | `1` deep slate | `2` slate | `3` wet stone | `4` stone | `5` pale stone |
| `6` sail cloth | `7` deep sea | `8` sea | `9` sea green | `a` foam | `b` dark moss |
| `c` moss | `d` lichen | `e` tar | `f` driftwood | `g` rust | `h` ochre |
| `i` sand | `j` dark brick | `k` brick | `l` lamp | `m` lamp glow | `n` rose |

The interface colours (`tokens.css` is generated from these), also usable in art:

| | | | | | |
|---|---|---|---|---|---|
| `G` night-0 | `H` night-1 | `I` night-2 | `J` night-3 | `K` night-4 | `L` fog |
| `M` chalk | `N` lamp | `O` lamp-dark | `P` kelp | `Q` kelp-dark | `R` brick |
| `S` brick-dark | `T` sea | `U` sea-dark | `V` rust | `W` moss-green | `Z` plum |

Daytime interface colours: `-` day-0, `+` day-1, `*` day-2 (white), `=` day-3, `~` day-ink, `%` day-fog.

Character ramps, hue-shifted (shadows lean cool, highlights lean warm):

| | | | | | |
|---|---|---|---|---|---|
| `o` shell highlight | `p` shell shadow | `q` brass shadow | `r` tomato highlight | `s` tomato shadow | `t` navy deep |
| `u` navy | `v` navy light | `w` warm white | `x` ink shadow | `y` mustard | `z` sea glass |

`X` and `Y` are Pip's neck sheen. The learner's character parts (`src/learner/`) also use `A` `B` `C` (fur, light to dark) and `D` `E` `F` (jumper), recoloured at runtime from the ramps in `palette.json`.

## The format

```
@sprite moss 48x40        name and frame size
@fps 6                    animation speed
@anchor 24 39             the pixel that stands on the ground
@frame idle-1             then exactly 40 rows of exactly 48 characters
...
@frame blink = idle-1     a copy of another frame...
@patch 31 9               ...with rows below written over it from (31, 9); '_' leaves a pixel alone
333
@anim idle idle-1*12 blink idle-1*8
```

## How the characters are drawn

Rules for every character (REDESIGN.md 6.2):

1. **Silhouette first.** Filled solid, it must read at 1x: a tortoise has a dome shell and a beaky head; a pigeon a round chest, a small head and a tail. `/dev/sprites` shows silhouettes; keep the review images in `sprites/review/<name>/`.
2. **One signature colour each**, used by nobody else as a main colour: Moss is moss green and brass, Pip slate grey with a teal-violet neck, Bea tomato red, Ferro navy, Mira mustard, Nell welding orange and soot, Priya raincoat yellow and lab white, Wendt plum and starry, the Arcade Committee green blazers, Penhallow white fur and an ochre oilskin.
3. **Ramps of 3 or 4 shades per material, hue-shifted**: cooler shadows, warmer highlights, never just darker and lighter versions of one hue.
4. **Characters pop**: more saturated and lighter than the desaturated background.
5. **Selective outline**: 1 px, the darkest shade of the colour next to it, never pure black; interior lines only where needed.
6. **Big readable faces** in portraits: eyes 2 to 4 px each with a 1 px highlight; expression from eyebrows (1 or 2 px lines), eyelids and the mouth.
7. **Light from the top left**, everywhere.
8. **No anti-aliasing**, except deliberate 1 px AA on big curves in portraits, in palette colours.

### Sizes, names and frames

| What | Size | Sprite name | Frames (exact names) |
|---|---|---|---|
| Dialogue portrait, main cast | 64x64, shown 3x | `portrait-<id>` | `neutral`, `talk-1`, `talk-2`, `pleased`, `proud`, `worried`, `confused`, `annoyed`, `laughing`, `squinting`, `surprised`, `blink`, `idle-1`, `idle-2` |
| Dialogue portrait, client | 64x64, shown 3x | `portrait-<id>` | `neutral`, `talk-1`, `talk-2`, `pleased`, `worried`, `confused`, `delighted`, `blink`, `idle-1`, `idle-2` |
| World sprite | 32x48 (Moss 48x40, Dennis 16x16) | `<id>` | `idle-1`, `idle-2`, `walk-1` to `walk-4`, `talk-1`, `talk-2`, `happy`, `puzzled` |
| Head icon | 16x16 | `head-<id>` | `idle` |

Portraits are head and shoulders, facing three-quarters right, with the same crop and eye line for everyone (eyes on rows 24 to 28). `talk-1` and `talk-2` are mouth open and closed; `blink` is `neutral` with the eyes shut; `idle-1` and `idle-2` are a small character idle (Moss's glasses slip down, Pip's head bobs, Bea brushes flour off her sleeve). Required anims on every portrait: `@anim neutral neutral`, `@anim talk talk-1 talk-2`, one `@anim <expression> <expression>` per expression, `@anim blink blink`, `@anim idle idle-1 idle-2`. The page blinks every 3 to 6 seconds and plays the idle at 4 to 6 fps.

Ids: `moss`, `pip`, `dennis`, `bea`, `ferro`, `mira`, `dev`, `kat`, `nell`, `priya`, `wendt`, `committee`, `reginald`, `penhallow`, and `learner-*` parts.

## The interface kit

`src/ui.txt` holds the interface's pixel parts, in the interface colours:

- **9-slice frames**, 24x24 with 8 px corners, applied with CSS `border-image` at 2x: `frame-panel` (wood and iron), `frame-paper` (the job ticket and Shelf labels only), `frame-dialogue` (the dialogue box), each with a `-day` version.
- **Icons**, 12x12 unless noted: `icon-run`, `icon-check`, `icon-stop`, `icon-hint` (a lamp), `icon-history`, `icon-reset`, `icon-keys`, `icon-settings` (a spanner), `icon-duck`, `icon-shelf`, `icon-map`, `icon-lock`, `icon-tick`, `icon-cross`, `icon-dash`, `icon-saved` (a floppy disk), `icon-offline` (a cloud with a cross), `icon-loader` (a spanner, 2 frames), `icon-more`, `icon-next` (the dialogue arrow), and `heart` (8x7, 2 frames for the beat). Icons are drawn in one colour (`M` chalk) so the page can recolour them; the heart and duck keep their own colours.
- **Brand**: `wordmark` (Fixwick in pixel letters), `mark` (16x16, a spanner crossed with the town's fish weathervane; the favicons are made from it).

## Scenes

`sprites/scenes/*.json` compose backgrounds from props: a fill colour, rectangles (optionally patterned) and props placed by position. `marks` are named top-left points where the page draws characters (`moss`, `learner`, `client`, `pip`, `dennis`, and so on) and the window area where rain falls. `previewActors` only affects `--preview`.

## Replacing a sprite with a hand-drawn PNG

To draw in Aseprite instead: export a horizontal strip of frames, left to right in the order listed above, using only `palette.json` colours, as `sprites/png/<name>.png`, and put `sprites/png/<name>.json` beside it:

```json
{ "w": 64, "h": 64, "fps": 6, "anchor": [32, 63], "frames": { "neutral": 0, "talk-1": 1, "talk-2": 2 }, "anims": { "neutral": [0], "talk": [1, 2] } }
```

Delete the matching `@sprite` block from `sprites/src` (the build refuses two sprites with one name). The build copies hand-drawn sheets into `public/sprites` unchanged. Keep the frame names so the pages keep working.

## Where the art came from

All of it was drawn for this course, as text grids. Some larger pieces were blocked out with simple shapes by a script first and then finished by hand in the grids; the grids are the source of truth.
