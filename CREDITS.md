# Credits

All pixel art was drawn for this project as text grids in `sprites/src` (see `sprites/README.md`). No external or generated artwork is used. If CC0 art is ever added, record its source and licence here and recolour it to `palette.json`.

## Fonts (self-hosted)

| Font | Author | Licence |
| --- | --- | --- |
| m6x11plus | Daniel Linssen | Free to use with attribution ("a font by Daniel Linssen") |
| Atkinson Hyperlegible Next | Braille Institute of America | SIL OFL 1.1 |
| JetBrains Mono | JetBrains | SIL OFL 1.1 |

The pixel display face, m6x11plus, is by Daniel Linssen and used with the attribution he asks for.

## Software

| Package | Use | Licence |
| --- | --- | --- |
| Pyodide | Python in the browser and in content tests | MPL-2.0 |
| CodeMirror 6, Lezer | Editor, highlighting | MIT |
| Next.js, React | Framework | MIT |
| ts-fsrs | Spaced repetition scheduling | MIT |
| @electric-sql/pglite | Local Postgres for development and tests | Apache-2.0 / PostgreSQL |
| postgres | Postgres driver for production | Unlicense |
| @supabase/supabase-js, @supabase/ssr | Auth in production | MIT |
| zod, yaml, marked | Content validation and rendering | MIT, ISC, MIT |
| idb | IndexedDB wrapper | ISC |
| fflate | Zip export | MIT |

## Sound

All sounds (the door bell, the typewriter key, the stamp, the dialogue blip) are synthesised in the browser with Web Audio in `lib/sound.ts`; there are no recordings. Any recorded sounds added must be CC0 and credited here.
