"use client";

// "Load a save", at the foot of "Who's playing?": for someone who has played
// before, in another browser or on another device, and kept a save (Settings, Your save). They
// load it here and go straight back to where they were, without picking who they are again.
import { useState } from "react";
import { Button } from "../ui/Button";
import { SaveLoader } from "../settings/SaveLoader";
import styles from "./HaveASave.module.css";

export function HaveASave({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.save}>
      <p className={styles.line}>
        <Button variant="ghost" size="sm" icon="folder" aria-expanded={open} aria-controls="have-a-save-loader" onClick={() => setOpen((o) => !o)} disabled={disabled}>
          Load a save
        </Button>
      </p>
      {open ? (
        <section id="have-a-save-loader" className={styles.loader} aria-label="Load your save">
          <SaveLoader where="welcome" />
        </section>
      ) : null}
    </div>
  );
}
