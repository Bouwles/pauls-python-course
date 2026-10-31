# Art

The illustrations for Paul's Python Course (REDESIGN-2.md Section 8): the cast, the Clocktower, the learner's avatar parts, the Shelf objects and the duck. Until each image arrives, the app shows a deliberately simple placeholder in its place.

| File | What it is |
|---|---|
| `ARTIST_BRIEF.md` | The brief to send the illustrator: the project, the style, the cast, every deliverable, specs, licence, milestones |
| `CAST_APPEARANCE.md` | How each of the six characters looks, in words |
| `manifest.json` | Every image the app needs: id, file name, canvas size, who or what, status (`placeholder` or `final`) |
| `final/` | The illustrator's exported PNGs |
| `pixel-reference/` | Rough pixel portraits of the cast, a guide to colours and hair only; the app doesn't use them |

**Never add photos of anyone** to this folder or anywhere in the repository (it may become public). Reference photos go to the illustrator directly.

## Adding the artist's files

1. Drop the PNGs into `art/final/`.
2. Run `npx tsx scripts/check-art.ts`.
3. Done.

The script checks each file against its entry in the manifest: the exact canvas size, and a transparent background for portraits, full-body poses, avatar parts, Shelf objects and the duck. Every file that passes is marked `final` in `manifest.json` and added to `components/art/final.generated.ts`, and from then on every screen that shows that image shows the real art, with no other change. A file that fails stays a placeholder, and the script says exactly why ("art/final/paul_portrait_pleased.png is 1000x1000 pixels; it should be 1024x1024") and exits with an error. It ends with a count of what's still a placeholder; `--list` lists them all by id.

Commit `art/final/`, `art/manifest.json` and `components/art/final.generated.ts` together. Keep the layered source files (PSD, Procreate, Clip Studio) outside the repository; only the PNG exports go in `art/final/`.

To replace an image, overwrite its PNG and run the script again. To check without changing anything (in CI, say), run `npx tsx scripts/check-art.ts --check`: it also fails if the manifest or the generated file is out of step with `art/final/`.

## The naming rule

**The file name is the id with every `.` replaced by `_`, plus `.png`.** Ids are lower case and never contain `_`; hyphens stay as they are.

| Id | File |
|---|---|
| `paul.portrait.pleased` | `paul_portrait_pleased.png` |
| `riya.body.action` | `riya_body_action.png` |
| `group.workshop` | `group_workshop.png` |
| `clocktower.shell` | `clocktower_shell.png` |
| `clocktower.floor3.open` | `clocktower_floor3_open.png` |
| `clocktower.floor3.open.day` | `clocktower_floor3_open_day.png` |
| `avatar.hair.hijab` | `avatar_hair_hijab.png` |
| `shelf.bill-splitter` | `shelf_bill-splitter.png` |
| `duck` | `duck.png` |

The parts, in order: who or what (`paul`, `group`, `clocktower`, `avatar`, `shelf`, `duck`), the kind (`portrait`, `body`, a floor, an avatar part), then the expression, pose, state or option. Clocktower floors are named as the building names them: `ground`, `floor1` to `floor7`, `roof`. A floor id without `.day` is the night version.

## Changing the list

The manifest is written by `npx tsx scripts/build-art-manifest.ts` from the cast (`lib/cast.ts`), the Clocktower's floors (`FLOORS` in the same file), the avatar's options (`lib/avatar.ts`) and Act I's projects (`content/acts`). Run it after changing any of those, or after changing a description in `CAST_APPEARANCE.md` that alters what the artist draws; it keeps every image's status. The canvas sizes and the id grammar live in `components/art/spec.ts`. Update `ARTIST_BRIEF.md` to match.

## How the art reaches the screen

The final images are **static imports through Next.js's image pipeline**, not files copied into `public/`. `scripts/check-art.ts` writes one `import` per final image into `components/art/final.generated.ts`, and `<Art>` hands that to `next/image`. That means:

- each image is resized to the width it's shown at and its double (a 64 px portrait gets 64w and 128w in its `srcset`), and served as WebP or AVIF to browsers that take them;
- each image's URL carries a hash of its contents, so a corrected file from the artist is never served stale from a cache (the optimiser can't invalidate files in `public/`);
- every image's real size is known when the app is built, and the build fails if a file the manifest calls final goes missing.

Next.js serves WebP by default. AVIF, and an exact 512 px step for large portraits, need this in `next.config.ts`:

```ts
images: {
  formats: ["image/avif", "image/webp"],
  imageSizes: [32, 48, 64, 96, 128, 180, 256, 360, 384, 512],
},
```

## Using art in code

```tsx
<Art id="paul.portrait.pleased" size={64} alt="Paul, pleased" />
```

`size` is the display width in CSS pixels (a portrait's diameter); `alt` is `""` when words beside it already say who it is. Use the helpers in `components/art/spec.ts` to build ids (`portraitId`, `bodyId`, `floorId`, `shelfId`) rather than writing them by hand.

- `<Portrait who="neil" name="Neil" expression="thinking" size={64} />`: the circle used by the coach and name tags. With final art, the portrait cut to a circle on the character's colour (falling back to their neutral portrait if that expression hasn't arrived); until then, their initial on their colour.
- `<Figure who="riya" name="Riya" expression="pleased" height={360} />` (or `pose="standing"` or `"action"`): the large illustration slot for Ask, Ship and "Meet the class".
- `<ShelfObject jobId="bill-splitter" client="riya" size={48} />`: a project's Shelf object.
- `<Art id="clocktower.floor3.open" size={720} alt="" />`: a Clocktower floor. When the daylight version is final too, both are rendered and the theme picks one; otherwise the night version shows in both themes.

The placeholders, until then: portraits are a circle in the character's colour with their initial; large slots a rounded rectangle with the initial and name; Clocktower floors a band in the resident's colour with the room's icon and name (muted with a padlock when locked, the residents' initials when busy); Shelf objects a Phosphor icon on a tile in the client's colour; the duck the drawn duck icon. Avatar parts have no placeholder: the learner's avatar stays an initials circle until its parts arrive.

## Reviewing the art

`/dev/art` (development only) shows every image in the manifest with its status and notes, at every size the app shows it, on the dark and the light theme side by side. For a final image it also lists the `srcset` widths Next.js will request.
