"use client";

// /certificate/#<link>: an Act certificate, drawn from its link (lib/share-links.ts). There's no
// server to ask, so the link is the certificate: the page draws it in the course's design (art.ts),
// saves it as a picture through a canvas, and prints it on one A4 landscape page. Anyone with the
// link can open it, and the page says plainly what it is: a record of what the link says, not a
// signed proof.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND } from "@/lib/brand";
import { decodeShare, playingAsLine, type CertificateLink } from "@/lib/share-links";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useHash } from "../classes/shared";
import { copyText } from "../classes/LinkBox";
import { ShareTrouble } from "../share/Trouble";
import { CertificateSvg } from "./CertificateSheet";
import { SHEET, certificateShapes, certificateWords, floorLine, paint, roughMeasure, type CertificateFacts, type Families, type Measure } from "./art";
import { ROMAN, longDate } from "./look";
import { certificateFonts } from "./fonts";
import styles from "./Certificate.module.css";

export interface CertificateAct {
  number: number;
  /** The Act's subject: "Algorithms and data structures". */
  name: string;
  /** Its main projects in this version of the course. */
  projects: number;
}

const slug = BRAND.name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-");

/** The faces the page shows, as lists the canvas can use. */
function familiesOf(el: Element): Families {
  const css = getComputedStyle(el);
  const list = (...names: string[]) => [...names.map((n) => css.getPropertyValue(n).trim()).filter(Boolean), "serif"].join(", ");
  const serif = list("--font-cert-serif");
  return { title: list("--font-cert-title", "--font-cert-serif"), script: list("--font-cert-script", "--font-cert-script-ext", "--font-cert-serif"), serif, italic: serif };
}

/** Load every face the certificate uses (the name may need a Latin Extended one), then measure with them. */
async function loadMeasure(el: Element, name: string): Promise<{ measure: Measure; families: Families }> {
  const families = familiesOf(el);
  const sample = `${name} ${BRAND.name} 0123456789`;
  await Promise.all([document.fonts.load(`400 56px ${families.title}`, sample), document.fonts.load(`400 56px ${families.script}`, sample), document.fonts.load(`400 56px ${families.serif}`, sample), document.fonts.load(`italic 400 56px ${families.italic}`, sample)]).catch(() => undefined);
  await document.fonts.ready;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return { measure: roughMeasure, families };
  const measure: Measure = (text, face, size) => {
    ctx.font = `${face === "italic" ? "italic " : ""}400 ${size}px ${families[face]}`;
    return ctx.measureText(text).width;
  };
  return { measure, families };
}

export function CertificateView({ acts, names }: { acts: CertificateAct[]; names: Record<string, string> }) {
  const hash = useHash();
  const decoded = useMemo(() => (hash === null ? null : decodeShare(hash, ["cert"])), [hash]);
  if (!decoded) return <p className={styles.what}>Reading the link.</p>;
  if (!decoded.ok) return <ShareTrouble problem={decoded.problem} kind={decoded.kind} hash={hash ?? ""} what="certificate" />;
  return <Certificate key={hash} cert={decoded.value.value as CertificateLink} acts={acts} names={names} />;
}

function Certificate({ cert, acts, names }: { cert: CertificateLink; acts: CertificateAct[]; names: Record<string, string> }) {
  const holder = useRef<HTMLDivElement>(null);
  const [fonts, setFonts] = useState<{ measure: Measure; families: Families } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const act = acts.find((a) => a.number === cert.act) ?? null;
  const roman = ROMAN[cert.act] ?? String(cert.act);
  const playing = playingAsLine(cert.maker, names);

  const facts: CertificateFacts = useMemo(
    () => ({
      name: cert.maker.name,
      act: cert.act,
      actName: act?.name ?? `Act ${roman}`,
      projects: cert.projects,
      day: cert.day,
      playingAs: playing && cert.maker.playAs ? { id: cert.maker.playAs, name: names[cert.maker.playAs] ?? cert.maker.playAs } : null,
    }),
    [cert, act, roman, playing, names],
  );

  useEffect(() => {
    setMounted(true);
    let gone = false;
    if (holder.current) void loadMeasure(holder.current, cert.maker.name).then((f) => !gone && setFonts(f));
    return () => {
      gone = true;
    };
  }, [cert.maker.name]);

  const shapes = useMemo(() => certificateShapes(facts, fonts?.measure ?? roughMeasure), [facts, fonts]);
  const words = certificateWords(facts);
  const file = `${slug}-certificate-act-${cert.act}`;

  const savePicture = async () => {
    setBusy(true);
    setNote("");
    try {
      const f = fonts ?? (holder.current ? await loadMeasure(holder.current, cert.maker.name) : null);
      const canvas = document.createElement("canvas");
      canvas.width = SHEET.width;
      canvas.height = SHEET.height;
      const ctx = canvas.getContext("2d");
      if (!ctx || !f) throw new Error("no canvas");
      paint(ctx, certificateShapes(facts, f.measure), f.families);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("no picture");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setNote(`Saved as ${file}.png.`);
    } catch {
      setNote("This browser wouldn't make the picture. Print it instead, and choose Save as PDF.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => setNote((await copyText(window.location.href)) ? "Copied the link. Anyone you send it to sees this page." : "This browser wouldn't copy it. Copy the address from the address bar instead.");

  return (
    <div className={`${styles.page} ${certificateFonts}`} ref={holder}>
      <CertificateSvg className={styles.image} shapes={shapes} label={words} />
      <section className={styles.verify} aria-labelledby="verify-title">
        <p className={styles.kicker}>
          <Icon name="graduation" size={24} />
          Certificate of completion
        </p>
        <h1 id="verify-title" className={styles.title}>
          {cert.maker.name}
        </h1>
        <p className={styles.what}>
          Completed Act {cert.act} of {BRAND.name}
          {act ? `, ${act.name}` : ""}, shipping {cert.projects} {cert.projects === 1 ? "project" : "projects"}.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt className="label">Completed</dt>
            <dd>{longDate(cert.day)}</dd>
          </div>
          {floorLine(cert.act) ? (
            <div>
              <dt className="label">Floor</dt>
              <dd>{floorLine(cert.act)!.split(",")[0]}</dd>
            </div>
          ) : null}
          {playing ? (
            <div>
              <dt className="label">Played as</dt>
              <dd>{facts.playingAs?.name}</dd>
            </div>
          ) : null}
        </dl>
        {!act ? <p className={styles.what}>This version of the course has no Act {cert.act}, so the certificate shows its number only.</p> : null}
        <div className={styles.row}>
          <Button variant="primary" icon="image" onClick={() => void savePicture()} disabled={busy}>
            Save as a picture
          </Button>
          <Button icon="fileText" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
          <Button variant="ghost" icon="copy" onClick={() => void copy()}>
            Copy the link
          </Button>
        </div>
        <p className={styles.note} role="status" aria-live="polite">
          {note}
        </p>
        <p className={styles.honest}>A keepsake for friends. Nothing signs the link, so it doesn&apos;t prove anything.</p>
      </section>
      {/* What prints: the certificate alone, filling an A4 landscape page. */}
      {mounted ? createPortal(<div className={`${styles.print} ${certificateFonts}`} aria-hidden="true"><CertificateSvg shapes={shapes} label={words} /></div>, document.body) : null}
    </div>
  );
}
