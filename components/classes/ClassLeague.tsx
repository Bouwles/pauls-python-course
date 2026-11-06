"use client";

// The Arcade League on a class you teach: the class's table for the week, from the register
// (each student's entry comes with their progress link), and "Share the table", a link anyone can
// open on the League page to see the standings. A student who opens it sees where they stand.
import { useEffect, useState } from "react";
import { BASE } from "@/lib/static";
import { isoWeek, previousWeek, weekName } from "@/lib/league/course";
import { rankRows } from "@/lib/league/table";
import { registerRows, tableToShare } from "@/lib/classes/league";
import { encodeTable, linkUrl } from "@/lib/classes/link";
import { loadBook } from "@/lib/classes/store";
import type { TaughtClass } from "@/lib/classes/types";
import { Button } from "../ui/Button";
import { LeagueTable } from "../league/LeagueTable";
import teach from "../teach/Teach.module.css";
import { LinkBox } from "./LinkBox";
import styles from "./Classes.module.css";

/** "Share the table": a League table link for a class you teach, for one week. */
export function ShareTable({ cls, week, disabled = false }: { cls: TaughtClass; week: string; disabled?: boolean }) {
  const [shown, setShown] = useState<{ url: string; at: number } | null>(null);
  // A link made before a new progress link came in, or for another week, would be out of date.
  useEffect(() => setShown(null), [cls.register, week]);
  const share = () => {
    const latest = loadBook().teaching.find((t) => t.id === cls.id) ?? cls;
    setShown({ url: linkUrl(window.location.origin, BASE, "table", encodeTable(tableToShare(latest, week))), at: Date.now() });
  };
  return (
    <div className={styles.desk}>
      <div className={styles.actions}>
        <Button icon="trophy" onClick={share} disabled={disabled}>
          Share the table
        </Button>
      </div>
      {shown ? (
        <LinkBox key={shown.at} url={shown.url} label={`League table link for ${cls.name}`} shareTitle={`${cls.name} in the Arcade League`} shareText={`${cls.name}'s Arcade League table, ${weekName(week).toLowerCase()}.`}>
          <p className={styles.linkNote}>Shows names and scores, nothing else.</p>
        </LinkBox>
      ) : null}
    </div>
  );
}

/** The class's League table for this week (or last), on the class page. */
export function ClassLeague({ cls }: { cls: TaughtClass }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [last, setLast] = useState(false);
  // The week is the browser's, worked out once it's in the browser.
  useEffect(() => setCurrent(isoWeek()), []);
  if (!current) return null;
  const week = last ? previousWeek(current) : current;
  const rows = rankRows(registerRows(cls, week));
  const titleId = `league-${cls.id}`;
  return (
    <div className={teach.files}>
      <div className={styles.detailHead}>
        <h3 id={titleId} className={teach.h3}>
          The Arcade League, {last ? weekName(week).toLowerCase() : "this week"}
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setLast(!last)}>
          {last ? "This week" : "Last week"}
        </Button>
      </div>
      {rows.length ? (
        <LeagueTable rows={rows} labelledBy={titleId} caption={`${cls.name}'s Arcade League table, ${weekName(week)}.`} />
      ) : (
        <p className={teach.empty}>No entries for {last ? "that week" : "this week"} yet. Each student&apos;s entry comes with their progress link.</p>
      )}
      <ShareTable cls={cls} week={week} disabled={rows.length === 0} />
    </div>
  );
}
