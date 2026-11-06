"use client";

// Settings, "Your save" (lib/save): a copy of everything this browser holds, to keep somewhere
// safe and load in another browser or on another device. On GitHub Pages, and for anyone not
// logged in, it's the only copy there is besides the browser's own; logged in, the account keeps
// one too. A save goes out as a file or as a code to paste into a note, and comes in either way.
import { useEffect, useState } from "react";
import { useSession } from "@/lib/store/session";
import { download } from "@/lib/export";
import { collectSave, lastSaved, markSaved, type SaveMark } from "@/lib/save/browser";
import { encodeSaveCode, saveFileName, saveJson } from "@/lib/save/format";
import { shortDay } from "@/lib/save/summary";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { Row, Section } from "./controls";
import { SaveLoader } from "./SaveLoader";
import styles from "./Settings.module.css";
import own from "./YourSave.module.css";

/** A code longer than this is better kept as a file: chats and notes may not take it whole. */
const LONG_CODE = 60_000;

export function YourSave() {
  const { store, user } = useSession();
  const toast = useToast();
  const [last, setLast] = useState<SaveMark | null | undefined>(undefined);
  const [busy, setBusy] = useState<"file" | "code" | null>(null);
  const [copied, setCopied] = useState<{ length: number } | null>(null);
  const [manual, setManual] = useState<string | null>(null);

  useEffect(() => {
    if (store) void lastSaved(store).then(setLast);
  }, [store]);

  const make = async () => {
    if (!store) return null;
    const save = await collectSave(store);
    await markSaved(store, save);
    setLast(await lastSaved(store));
    return save;
  };

  const downloadSave = async () => {
    setBusy("file");
    try {
      const save = await make();
      if (save) {
        download(saveFileName(save), saveJson(save), "application/json");
        toast("Save downloaded. Keep it somewhere safe.");
      }
    } finally {
      setBusy(null);
    }
  };

  const copyCode = async () => {
    setBusy("code");
    setCopied(null);
    setManual(null);
    try {
      const save = await make();
      if (!save) return;
      const code = encodeSaveCode(save);
      try {
        await navigator.clipboard.writeText(code);
        setCopied({ length: code.length });
        toast("Save code copied.");
      } catch {
        // The browser said no (no permission, or not a secure page): it's shown to copy by hand.
        setManual(code);
      }
    } finally {
      setBusy(null);
    }
  };

  const lastLine = last === undefined ? "" : last ? `Your last save: ${shortDay(last.at)}.` : "You haven't made one yet.";
  const intro = user
    ? "Your work is kept in your account. A save is a copy of it as a file."
    : "Your progress, code, review deck and classes, in one file. Load it in another browser to carry on there.";

  return (
    <Section id="s-save" title="Your save" intro={intro}>
      <Row label="Download my save" hint={lastLine || undefined}>
        <Button variant={user ? "secondary" : "primary"} icon="download" onClick={() => void downloadSave()} disabled={!store || busy !== null}>
          Download my save
        </Button>
      </Row>
      <Row label="Copy my save code" hint="The same, as text you can paste.">
        <Button variant="secondary" icon="copy" onClick={() => void copyCode()} disabled={!store || busy !== null}>
          {busy === "code" ? "Making it" : "Copy my save code"}
        </Button>
      </Row>
      {copied || manual ? (
        <div className={own.copied}>
          {copied ? (
            <p className={styles.hint} role="status">
              Copied: {copied.length.toLocaleString("en-GB")} characters. Paste it somewhere you&apos;ll find it again.
              {copied.length > LONG_CODE ? " It's a long one, so a save file may be easier to keep." : ""}
            </p>
          ) : null}
          {manual ? (
            <>
              <label htmlFor="save-code-out" className={styles.hint}>
                This browser wouldn&apos;t copy it for you. Select all of it here and copy it.
              </label>
              <textarea id="save-code-out" className={own.out} readOnly value={manual} rows={4} onFocus={(e) => e.currentTarget.select()} />
            </>
          ) : null}
        </div>
      ) : null}
      <Row label="Load a save" hint="A save file or a save code." wide>
        <SaveLoader />
      </Row>
    </Section>
  );
}
