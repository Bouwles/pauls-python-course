import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Doc } from "@/components/legal/Doc";
import { BRAND } from "@/lib/brand";
import { getIndex } from "@/lib/content/server";

export const metadata: Metadata = { title: "Credits" };

// The same credits as CREDITS.md at the project root; the datasets come from the content itself.

const FONTS: [string, string, string][] = [
  ["Fredoka", "the display face, for titles, names, buttons and labels", "by the Fredoka Project Authors, SIL Open Font License 1.1"],
  ["Atkinson Hyperlegible Next", "the text face, for reading and for anything you type", "by the Braille Institute of America, SIL Open Font License 1.1"],
  ["JetBrains Mono", "the code face", "by JetBrains, SIL Open Font License 1.1"],
  ["UnifrakturMaguntia", "the course's name on certificates", "by j. 'mach' wust, SIL Open Font License 1.1"],
  ["Pinyon Script", "names on certificates", "by Nicole Fally, SIL Open Font License 1.1"],
  ["Old Standard TT", "the wording on certificates", "by Alexey Kryukov, SIL Open Font License 1.1"],
];

const SOFTWARE: [string, string, string][] = [
  ["Pyodide", "Python in the browser, which runs every program in the course", "MPL-2.0"],
  ["CodeMirror 6 and Lezer", "the code editor and the syntax highlighting", "MIT"],
  ["Next.js and React", "the site itself", "MIT"],
  ["ts-fsrs", "the spaced repetition scheduler behind Morning Rounds", "MIT"],
  ["PGlite", "Postgres in WebAssembly, for development and tests", "Apache-2.0 and PostgreSQL"],
  ["postgres", "the Postgres driver in production", "Unlicense"],
  ["Supabase client libraries", "accounts in production", "MIT"],
  ["Zod, YAML and marked", "reading and checking the course content", "MIT and ISC"],
  ["idb", "saving your work in the browser", "ISC"],
  ["fflate", "zip files for exports", "MIT"],
  ["next/og (Satori and resvg)", "certificates and share cards, drawn on the server", "MPL-2.0"],
];

export default function Credits() {
  // Every public dataset a project uses, once each, with the projects that use it.
  const datasets = new Map<string, { name: string; source: string; licence: string; projects: string[] }>();
  for (const act of getIndex().acts)
    for (const job of act.jobs)
      for (const d of job.datasets ?? []) {
        const key = d.source + d.name;
        const seen = datasets.get(key) ?? { name: d.name, source: d.source, licence: d.licence, projects: [] };
        if (!seen.projects.includes(job.title)) seen.projects.push(job.title);
        datasets.set(key, seen);
      }

  return (
    <Page narrow>
      <Doc title="Credits" lede={`Who and what ${BRAND.name} is built from.`}>
        <h2>Art</h2>
        <p>
          The six characters, your avatar, and the Clocktower and its rooms are pixel art drawn in code for this project. Each person is put together pixel by pixel from a look (face, hair, glasses, clothes) and a moment (a face, a gesture, a blink, a word half said), and each room the same way, so they can talk, react and fill up as you work.
        </p>
        <p>The logo, a snake curled into a P, and the small heart in the credit line are pixel art drawn for this project too.</p>
        <h2>Type</h2>
        <ul>
          {FONTS.map(([name, use, who]) => (
            <li key={name}>
              <strong>{name}</strong>, {use}, {who}.
            </li>
          ))}
        </ul>
        <h2>Icons</h2>
        <p>
          <strong>pixelarticons</strong>, by Gerrit Halfmann, MIT License, drawn on a 24-pixel grid. The rubber duck and the crab are drawn for this project on the same grid to match.
        </p>
        <h2>Sound</h2>
        <p>Every sound is made in your browser as it plays, with Web Audio. There are no recordings.</p>
        <h2>Data</h2>
        <p>Real public data, with its source and licence. Each project keeps a small copy so it works offline, and lists it again in its own README.</p>
        <ul>
          {[...datasets.values()].map((d) => (
            <li key={d.source + d.name}>
              <strong>{d.name}</strong>, for {d.projects.join(" and ")}: <a href={d.source}>source</a>, {d.licence}.
            </li>
          ))}
          <li>
            <strong>The SMS Spam Collection</strong>, by Tiago A. Almeida and José María Gómez Hidalgo, from the UCI Machine Learning Repository, CC BY 4.0: the spam filter&apos;s results on the home page.
          </li>
        </ul>
        <h2>Software</h2>
        <ul>
          {SOFTWARE.map(([name, what, licence]) => (
            <li key={name}>
              <strong>{name}</strong>: {what}. {licence}.
            </li>
          ))}
        </ul>
        <h2>Ideas</h2>
        <p>
          The teaching borrows from computing education research: PRIMM (Predict, Run, Investigate, Modify, Make), worked examples with subgoal labels, Parsons problems, erroneous examples, retrieval practice and spaced repetition. The step-through visualiser follows the idea of Philip Guo&apos;s Python Tutor.
        </p>
      </Doc>
    </Page>
  );
}
