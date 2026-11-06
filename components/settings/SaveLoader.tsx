"use client";

// Loading a save (lib/save): from a save file or a pasted save code, in Settings and on the
// Welcome screen. Nothing changes until the person has seen what's in it ("Caitlin, 12 projects
// shipped, 1 class, saved 6 Nov") and chosen: replace what this browser holds, or merge the two,
// keeping the furthest progress on each step and project and the newest code. A browser with
// nothing in it just loads. Logged in, a save is only ever merged into the account's work, since
// the account keeps its own copy. Once it's in, the page starts again at the Clocktower so every
// screen reads the new work.
import { useEffect, useId, useRef, useState } from "react";
import { BASE } from "@/lib/static";
import { castColour } from "@/lib/cast";
import { useSession } from "@/lib/store/session";
import { applySave, collectSave, type LoadMode } from "@/lib/save/browser";
import { SAVE_LIMITS, decodeSaveText, problemText, type SaveData } from "@/lib/save/format";
import { describeDetail, describeSave, summarise, type SaveSummary } from "@/lib/save/summary";
import { PixelPerson } from "../art/PixelPerson";
import { Button } from "../ui/Button";
import styles from "./SaveLoader.module.css";

interface Found {
  save: SaveData;
  skipped: number;
  summary: SaveSummary;
  /** What this browser holds now. */
  here: SaveSummary;
}

/** Who's in a save, as a small pixel head on their colour. */
export function SaveFace({ summary }: { summary: SaveSummary }) {
  return (
    <span className={styles.face} style={{ background: summary.playAs ? castColour(summary.playAs).face : summary.character.colour }} aria-hidden="true">
      <PixelPerson who={summary.playAs ?? undefined} avatar={summary.playAs ? undefined : summary.character} crop="head" scale={2} animate={false} />
    </span>
  );
}

export function SaveLoader({ where = "settings" }: { where?: "settings" | "welcome" }) {
  const { store, user, ready } = useSession();
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState<"reading" | LoadMode | null>(null);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const foundTitle = useRef<HTMLParagraphElement>(null);
  const ids = useId();

  // A save found: its line takes the focus, so it's read out and the choice is next.
  useEffect(() => {
    if (found) foundTitle.current?.focus();
  }, [found]);

  const read = async (text: string) => {
    if (!store) return;
    setError(null);
    setFound(null);
    setBusy("reading");
    // Let "Reading" show before a big save takes the page's attention.
    await new Promise((r) => setTimeout(r, 0));
    const got = decodeSaveText(text);
    if (!got.ok) {
      setError(problemText(got.problem));
      setBusy(null);
      return;
    }
    const here = summarise(await collectSave(store));
    setFound({ save: got.save, skipped: got.skipped, summary: summarise(got.save), here });
    setBusy(null);
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > SAVE_LIMITS.fileBytes) {
      setFound(null);
      setError(problemText("too-big"));
      return;
    }
    try {
      await read(await file.text());
    } catch {
      setError("That file couldn't be opened. Try choosing it again.");
    }
  };

  const load = async (mode: LoadMode) => {
    if (!store || !found) return;
    setBusy(mode);
    try {
      await applySave(store, found.save, mode);
      setDone(true);
      // Every screen reads the new work from the start.
      setTimeout(() => window.location.assign(`${BASE}/`), 900);
    } catch {
      setBusy(null);
      setError("This browser wouldn't take the save. If it's in a private window, try a normal one.");
    }
  };

  const cancel = () => {
    setFound(null);
    setError(null);
    setPasted("");
  };

  const notReady = !ready || !store;
  const fresh = found ? found.here.empty : false;

  return (
    <div className={styles.loader}>
      {found ? null : (
        <div className={styles.ways}>
          <div className={styles.way}>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                void readFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button variant={where === "welcome" ? "primary" : "secondary"} icon="folder" onClick={() => fileInput.current?.click()} disabled={notReady || busy !== null}>
              Choose a save file
            </Button>
          </div>
          <form
            className={styles.paste}
            onSubmit={(e) => {
              e.preventDefault();
              void read(pasted);
            }}
          >
            <label htmlFor={`${ids}-code`} className={styles.pasteLabel}>
              Or paste a save code
            </label>
            <textarea
              id={`${ids}-code`}
              className={styles.code}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={3}
              spellCheck={false}
              autoComplete="off"
              placeholder="ppc-save.1..."
            />
            <div>
              <Button type="submit" variant="secondary" disabled={notReady || busy !== null || !pasted.trim()}>
                {busy === "reading" ? "Reading it" : "Read the code"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {found ? (
        <div className={`px-panel ${styles.found}`} role="group" aria-labelledby={`${ids}-found`}>
          <div className={styles.what}>
            <SaveFace summary={found.summary} />
            <div className={styles.whatText}>
              <p className="label">In this save</p>
              <p id={`${ids}-found`} ref={foundTitle} tabIndex={-1} className={styles.line}>
                {describeSave(found.summary)}
              </p>
              <p className={styles.hint}>{describeDetail(found.summary)}</p>
              {found.skipped ? <p className={styles.hint}>A few parts of it didn&apos;t read, so they&apos;ll be left out.</p> : null}
            </div>
          </div>

          {user ? (
            <p className={styles.hint}>You&apos;re logged in, so it&apos;s added to your account&apos;s work: the furthest you got on each step and project, and the newest code, from either.</p>
          ) : fresh ? null : (
            <div className={styles.here}>
              <p>
                This browser has <strong className={styles.strong}>{describeSave(found.here, { saved: false })}</strong>.
              </p>
              <p className={styles.hint}>Replacing swaps all of that for the save. Merging keeps both: the furthest you got on each step and project, and the newest code.</p>
            </div>
          )}

          {done ? (
            <p className={styles.done} role="status">
              Loaded. Off to the Clocktower.
            </p>
          ) : (
            <div className={styles.buttons}>
              {user ? (
                <Button variant="primary" onClick={() => void load("merge")} disabled={busy !== null}>
                  {busy === "merge" ? "Adding it" : "Add it to my account"}
                </Button>
              ) : fresh ? (
                <Button variant="primary" onClick={() => void load("replace")} disabled={busy !== null}>
                  {busy === "replace" ? "Loading it" : "Load this save"}
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={() => void load("replace")} disabled={busy !== null}>
                    {busy === "replace" ? "Replacing" : "Replace what's here"}
                  </Button>
                  <Button variant="secondary" onClick={() => void load("merge")} disabled={busy !== null}>
                    {busy === "merge" ? "Merging" : "Merge the two"}
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={cancel} disabled={busy !== null}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
