"use client";

// The first job, playable on the landing page. Python and the editor load only
// when this section is scrolled into view, so the page itself stays light.
import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Character, Job } from "@/lib/content/types";
import styles from "./Landing.module.css";

const Workbench = dynamic(() => import("../workbench/Workbench").then((m) => m.Workbench), { ssr: false });

export function PlayableJob({ job, characters, conceptTitles, actTitle }: { job: Job; characters: Record<string, Character>; conceptTitles: Record<string, string>; actTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setShow(true);
        io.disconnect();
      }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.playable}>
      {show ? (
        <Suspense>
          <Workbench job={job} characters={characters} conceptTitles={conceptTitles} actTitle={actTitle} landing />
        </Suspense>
      ) : (
        <div className={styles.waiting}>Opening the workbench.</div>
      )}
    </div>
  );
}
