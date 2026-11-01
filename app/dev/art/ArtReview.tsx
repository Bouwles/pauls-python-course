"use client";

import { useMemo, useState } from "react";
import { getImageProps } from "next/image";
import { Art, hasFinalArt } from "@/components/art/Art";
import { FINAL } from "@/components/art/final.generated";
import { castName } from "@/components/art/placeholders";
import { Portrait, type Expression } from "@/components/art/Portrait";
import { EXPRESSIONS, KINDS, canvasFor, type ArtKind, type Manifest, type ManifestEntry } from "@/components/art/spec";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import styles from "./ArtReview.module.css";

type Show = "all" | "placeholder" | "final";

/** How a kind is split up for the second filter: by person, floor or avatar part. */
const subgroup = (e: ManifestEntry): string | null => {
  if (e.kind === "portrait" || e.kind === "body") return e.character;
  if (e.kind === "floor") return e.id.split(".")[1] ?? null;
  if (e.kind === "avatar") return e.part ?? null;
  return null;
};

const subgroupLabel = (kind: ArtKind, key: string) => (kind === "floor" ? (key === "ground" ? "Ground floor" : key === "roof" ? "The roof" : `Floor ${key.slice(5)}`) : kind === "avatar" ? castName(key.replace("-", " ")) : castName(key));

/** The widths in a final image's srcset, as Next.js will request them. */
function srcsetWidths(id: string, size: number): string {
  const src = FINAL[id];
  const canvas = canvasFor(id);
  if (!src || !canvas) return "";
  const { props } = getImageProps({ src, alt: "", width: size, height: Math.round((size * canvas.height) / canvas.width) });
  return (props.srcSet ?? "")
    .split(", ")
    .map((s) => {
      const [url, density] = s.split(" ");
      return `${new URL(url!, "http://x").searchParams.get("w")}w ${density}`;
    })
    .join(", ");
}

function Previews({ entry }: { entry: ManifestEntry }) {
  const alt = entry.notes;
  return (
    <div className={styles.sizes}>
      {entry.display.map((size) => (
        <figure key={size} className={styles.size}>
          <div className={styles.stage}>
            {entry.kind === "avatar" && !hasFinalArt(entry.id) ? (
              <span className={styles.none} style={{ width: size, height: size }}>
                None
              </span>
            ) : (
              <Art id={entry.id} size={size} alt={alt} who={entry.character ?? undefined} />
            )}
          </div>
          <figcaption className={styles.caption}>{size} px</figcaption>
        </figure>
      ))}
      {entry.kind === "portrait" && entry.character
        ? [36, 68, 108].map((size) => (
            <figure key={`tile-${size}`} className={styles.size}>
              <div className={styles.stage}>
                {/* The pixel person in this expression; "crown" is Paul's crown scene, drawn proud. */}
                <Portrait who={entry.character!} name={castName(entry.character!)} size={size} expression={(EXPRESSIONS as readonly string[]).includes(entry.expression ?? "") ? (entry.expression as Expression) : "proud"} />
              </div>
              <figcaption className={styles.caption}>On the tile, {size} px</figcaption>
            </figure>
          ))
        : null}
    </div>
  );
}

function Entry({ entry }: { entry: ManifestEntry }) {
  const final = hasFinalArt(entry.id);
  const outOfStep = final !== (entry.status === "final");
  const wide = entry.display[entry.display.length - 1]! > 300;
  return (
    <li className={`px-panel ${styles.entry}`}>
      <div className={styles.head}>
        <code className={styles.id}>{entry.id}</code>
        <Badge tone={entry.status === "final" ? "shipped" : "neutral"}>{entry.status === "final" ? "Final" : "Placeholder"}</Badge>
        {entry.required ? null : <Badge tone="info">Optional</Badge>}
        {outOfStep ? <Badge tone="fail">Run scripts/check-art.ts</Badge> : null}
      </div>
      <p className={styles.meta}>
        <span className={styles.file}>art/final/{entry.file}</span>
        <span>
          {entry.size.width} x {entry.size.height} px, {entry.transparent ? "transparent" : "opaque"}
        </span>
      </p>
      <p className={styles.notes}>{entry.notes}</p>
      {final ? (
        <p className={styles.meta}>
          srcset at each size:{" "}
          {entry.display.map((s) => (
            <span key={s} className={styles.file}>
              {s}: {srcsetWidths(entry.id, s)}
            </span>
          ))}
        </p>
      ) : null}
      <div className={wide ? styles.panesStacked : styles.panes}>
        <section className={`${styles.pane} ${styles.dark}`} aria-label={`${entry.id} on the dark theme`}>
          <p className={styles.paneName}>Dark</p>
          <Previews entry={entry} />
        </section>
        <section className={`${styles.pane} ${styles.light}`} aria-label={`${entry.id} on the light theme`}>
          <p className={styles.paneName}>Light</p>
          <Previews entry={entry} />
        </section>
      </div>
    </li>
  );
}

export function ArtReview({ manifest }: { manifest: Manifest }) {
  const kinds = (Object.keys(KINDS) as ArtKind[]).filter((k) => manifest.entries.some((e) => e.kind === k));
  const [kind, setKind] = useState<ArtKind>(kinds[0] ?? "portrait");
  const [group, setGroup] = useState("all");
  const [show, setShow] = useState<Show>("all");
  const ofKind = useMemo(() => manifest.entries.filter((e) => e.kind === kind), [manifest, kind]);
  const groups = useMemo(() => [...new Set(ofKind.map(subgroup).filter((g): g is string => !!g))], [ofKind]);
  const shown = ofKind.filter((e) => (group === "all" || subgroup(e) === group) && (show === "all" || e.status === show));
  const required = manifest.entries.filter((e) => e.required);
  const done = required.filter((e) => e.status === "final").length;

  return (
    <div className={styles.review}>
      <header className={styles.top}>
        <h1 className={styles.title}>Art review</h1>
        <p className={styles.lede}>
          Every image in <code>art/manifest.json</code>: {done} of {required.length} required images are final. Drop the artist&apos;s PNGs into <code>art/final/</code> and run <code>npx tsx scripts/check-art.ts</code>; see <code>art/README.md</code>.
        </p>
      </header>
      <Tabs
        label="Kind of image"
        idPrefix="art"
        className={styles.kinds}
        value={kind}
        onChange={(k) => {
          setKind(k as ArtKind);
          setGroup("all");
        }}
        items={kinds.map((k) => {
          const all = manifest.entries.filter((e) => e.kind === k);
          return { id: k, label: KINDS[k].label, count: `${all.filter((e) => e.status === "final").length}/${all.length}` };
        })}
      />
      <div className={styles.filters} id={`art-${kind}-panel`} role="tabpanel" aria-labelledby={`art-${kind}`}>
        <p className={styles.spec}>
          Canvas {KINDS[kind].width} x {KINDS[kind].height} px{kind === "floor" ? " (the roof 2400 x 800)" : ""}, {KINDS[kind].transparent ? "transparent background" : "opaque background"}, shown at {KINDS[kind].display.join(", ")} px wide.
        </p>
        <div className={styles.controls}>
          {groups.length > 1 ? (
            <label className={styles.control}>
              <span className="label">Show only</span>
              <select value={group} onChange={(e) => setGroup(e.target.value)} className={styles.select}>
                <option value="all">All</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {subgroupLabel(kind, g)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className={styles.control}>
            <span className="label">Status</span>
            <select value={show} onChange={(e) => setShow(e.target.value as Show)} className={styles.select}>
              <option value="all">Any</option>
              <option value="placeholder">Placeholders</option>
              <option value="final">Final</option>
            </select>
          </label>
        </div>
        {shown.length ? (
          <ul className={styles.list}>
            {shown.map((e) => (
              <Entry key={e.id} entry={e} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}
