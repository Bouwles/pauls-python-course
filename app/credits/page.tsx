import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Doc } from "@/components/legal/Doc";

export const metadata: Metadata = { title: "Credits" };

const SOFTWARE: [string, string, string][] = [
  ["Pyodide", "Python compiled to WebAssembly, which runs every program in the course", "MPL-2.0"],
  ["CodeMirror and Lezer", "The code editor and the syntax highlighting", "MIT"],
  ["Next.js and React", "The site itself", "MIT"],
  ["ts-fsrs", "The spaced repetition scheduler behind Morning Rounds", "MIT"],
  ["PGlite", "Postgres in WebAssembly, for local development", "Apache-2.0 and PostgreSQL"],
  ["Zod, YAML, marked", "Reading and checking the course content", "MIT and ISC"],
  ["idb", "Saving your work in the browser", "ISC"],
  ["fflate", "Zip files for exports", "MIT"],
  ["Supabase client libraries", "Accounts and storage in production", "MIT"],
];

const FONTS: [string, string][] = [
  ["Source Serif 4", "Frank Grießhammer for Adobe, SIL Open Font License 1.1"],
  ["IBM Plex Sans", "Mike Abbink and Bold Monday for IBM, SIL Open Font License 1.1"],
  ["JetBrains Mono", "JetBrains, SIL Open Font License 1.1"],
  ["Atkinson Hyperlegible", "Braille Institute of America, SIL Open Font License 1.1"],
];

export default function Credits() {
  return (
    <Page narrow>
      <Doc title="Credits">
        <p>Every pixel in Saltmarsh was drawn for this course, as text grids you can read in the repository. No artwork was generated.</p>
        <h2>Type</h2>
        <ul>
          {FONTS.map(([name, who]) => (
            <li key={name}>
              <strong>{name}</strong>, {who}.
            </li>
          ))}
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
