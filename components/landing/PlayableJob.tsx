"use client";

// The first project, playable on the landing page ("Try it now", REDESIGN-2.md 6). Python and
// the editor load only when this section comes near the screen, so the page itself stays light.
import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Character, Job } from "@/lib/content/types";
import { Icon } from "../ui/Icon";
import styles from "./Landing.module.css";

const Workbench = dynamic(() => import("../workbench/Workbench").then((m) => m.Workbench), { ssr: false, loading: () => <Waiting /> });

function Waiting() {
  return (
    <div className={styles.waiting} role="status">
      <Icon name="loader" spin />
      <span>Opening the Workbench</span>
    </div>
  );
}

export function PlayableJob({ job, characters, conceptTitles, actTitle }: { job: Job; characters: Record<string, Character>; conceptTitles: Record<string, string>; actTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.playable}>
      {show ? (
        <Suspense fallback={<Waiting />}>
          <Workbench job={job} characters={characters} conceptTitles={conceptTitles} actTitle={actTitle} landing />
        </Suspense>
      ) : (
        <Waiting />
      )}
    </div>
  );
}
