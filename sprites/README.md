# Sprites

Every pixel in Saltmarsh is a character in a text file in `sprites/src`. `npm run sprites` (also run by `npm run dev` and `npm run build`) turns them into PNG sheets in `public/sprites`.

## Editing a sprite

Open the `.txt` file, find the frame, change characters, save, and run:

```
npm run sprites -- --preview
```

`--preview` also writes enlarged copies to `sprites/preview/` (one file per sprite, plus `-sheet.png` with every frame) so you can look at your change. That folder is not committed.

Each character is one pixel. `.` is transparent. Every other character is a colour from `palette.json`:

| | | | | | |
|---|---|---|---|---|---|
| `0` harbour night | `1` deep slate | `2` slate | `3` wet stone | `4` stone | `5` pale stone |
| `6` sail cloth | `7` deep sea | `8` sea | `9` sea green | `a` foam | `b` dark moss |
| `c` moss | `d` lichen | `e` tar | `f` driftwood | `g` rust | `h` ochre |
| `i` sand | `j` dark brick | `k` brick | `l` lamp | `m` lamp glow | `n` rose |

`X` and `Y` are Pip's neck sheen, the only colours allowed outside the palette. The learner's character parts (`src/learner/`) also use `A` `B` `C` (coat, light to dark) and `D` `E` `F` (jumper), which are recoloured from the ramps in `palette.json` when the page draws them.

The build refuses any other character, so nothing off-palette can slip in.

## The format

```
@sprite moss 40x32        name and frame size
@fps 4                    animation speed
@anchor 21 31             the pixel that stands on the ground
@frame idle-1             then exactly 32 rows of exactly 40 characters
...
@frame blink = idle-1     a copy of another frame...
@patch 31 9               ...with rows below written over it from (31, 9); '_' leaves a pixel alone
333
@anim idle idle-1*12 blink idle-1*8
```

Rules the art follows (Section 7.3 of the spec): light from the top-left, two or three shades per material, a one-pixel outline in a darker shade of the colour next to it (never pure black), whole-number scaling only, no anti-aliasing, no gradients, dithering only in sky and water.

## Scenes

`sprites/scenes/*.json` compose backgrounds from props: a fill colour, rectangles (optionally patterned) and props placed by position. `marks` are named points the page uses to place characters (`moss`, `learner`, `client`, `dennis`) and the window area where rain falls. `previewActors` only affects `--preview`, so you can check a composition with characters in it.

## Replacing a sprite with a hand-drawn PNG

If you would rather draw in Aseprite: export a horizontal strip of frames using only `palette.json` colours as `sprites/png/<name>.png`, and put `sprites/png/<name>.json` beside it in the same shape as the generated ones (`w`, `h`, `fps`, `anchor`, `frames`, `anims`). Delete the matching `@sprite` block from `sprites/src` (the build refuses two sprites with one name). The build copies hand-drawn sheets into `public/sprites` unchanged. Keep the frame names (`idle-1`, `talk-1` and so on) so the pages keep working.

## Where the art came from

All of it was drawn for this course. Some larger pieces (Moss, the map, the workshop props) were blocked out with simple shapes by a script first and then finished by hand in the text grids; the grids are the source of truth.
