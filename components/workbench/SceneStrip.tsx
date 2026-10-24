"use client";

import { useEffect, useMemo, useState } from "react";
import type { Line, Step } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import { defaultLook } from "@/lib/pixel/learner";
import { SceneCanvas, type Actor } from "../world/SceneCanvas";
import { PixelText } from "../world/PixelText";
import { Portrait } from "../world/Portrait";
import { loadIndex } from "../world/sprites";
import { useNight } from "../world/useNight";
import { Button } from "../ui/Button";
import { useWorkbench } from "./context";
import { SCENE_CAST, sceneFor, useEarned, workshopExtras } from "../world/useWorkshopExtras";
import styles from "./SceneStrip.module.css";
import { playSound } from "@/lib/sound";

function stepLines(step: Step, lessTalk: boolean): Line[] {
  const lines = step.dialogue;
  if (!lessTalk) return lines;
  return step.type === "ask" || step.type === "ship" ? lines.slice(0, 1) : [];
}

export function SceneStrip({ step, reaction, onDismissReaction }: { step: Step; reaction: (Line & { id: number }) | null; onDismissReaction: () => void }) {
  const { job, characters, lessTalk } = useWorkbench();
  const { profile } = useSession();
  const night = useNight();
  const lines = useMemo(() => stepLines(step, lessTalk), [step, lessTalk]);
  const [index, setIndex] = useState(0);
  const [available, setAvailable] = useState<Set<string>>(new Set(["moss", "pip", "dennis"]));
  const [scenes, setScenes] = useState<Set<string> | undefined>(undefined);
  const [squeak, setSqueak] = useState(false);
  const earned = useEarned();

  useEffect(() => {
    setIndex(0);
  }, [step.id]);

  useEffect(() => {
    void loadIndex().then((i) => {
      setAvailable(new Set(Object.keys(i.sprites)));
      setScenes(new Set(Object.keys(i.scenes)));
    });
  }, []);

  const showing: Line | null = reaction ?? lines[index] ?? null;
  const speaker = showing?.who ?? null;
  const clientPresent = (step.type === "ask" || step.type === "ship") && job.client !== "moss" && available.has(characters[job.client]?.sprite ?? job.client);
  const pipPresent = step.type === "pips";

  // The bell over the door rings when a client comes in.
  useEffect(() => {
    if (clientPresent && step.type === "ask") playSound("bell", profile.settings.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, clientPresent]);

  const actors: Actor[] = [
    { key: "moss", sprite: "moss", anim: speaker === "moss" ? "talk" : "idle", at: "moss" },
    { key: "learner", learner: profile.character ?? defaultLook(), pose: "sit", anim: "sit", at: "learner" },
    { key: "dennis", sprite: "dennis", anim: squeak ? "squeak" : "idle", at: "dennis" },
  ];
  if (clientPresent) {
    const sprite = characters[job.client]?.sprite ?? job.client;
    actors.push({ key: "client", sprite, anim: speaker === job.client ? "talk" : step.type === "ship" ? "happy" : "idle", at: "client", flip: true });
  }
  if (pipPresent) actors.push({ key: "pip", sprite: "pip", anim: speaker === "pip" ? "talk" : "idle", at: "pip", flip: true });
  const scene = sceneFor(job.scene, night, scenes);
  const inWorkshop = scene.startsWith("workshop");
  if (inWorkshop) actors.push(...workshopExtras(earned));
  // Characters who live in this scene (Old Tom in the lamp room) are drawn when the Job's dialogue has them.
  for (const who of SCENE_CAST[scene] ?? []) {
    const spoken = job.steps.some((st) => st.dialogue.some((l) => l.who === who));
    if (spoken && available.has(characters[who]?.sprite ?? who)) actors.push({ key: who, sprite: characters[who]?.sprite ?? who, anim: speaker === who ? "talk" : "idle", at: who });
  }

  const name = speaker ? (characters[speaker]?.name ?? (speaker === "narrator" ? "" : speaker)) : "";
  const portraitSprite = speaker && available.has(characters[speaker]?.sprite ?? "") ? characters[speaker]!.sprite : "moss";
  const more = !reaction && index < lines.length - 1;
  const finished = !reaction && lines.length > 1 && index === lines.length - 1;

  const squeakDennis = () => {
    setSqueak(true);
    setTimeout(() => setSqueak(false), 400);
    window.dispatchEvent(new CustomEvent("ppc:dennis"));
  };

  return (
    <section className={styles.strip} aria-label={scene === "lamp-room" ? "The lamp room" : "The workshop"}>
      <div className={styles.window}>
        <SceneCanvas
          scene={scene}
          actors={actors}
          label={sceneLabel(step, clientPresent, characters[job.client]?.name, scene)}
          maxScale={2}
          minScale={1}
          hotspots={[{ key: "dennis", at: "dennis", w: 12, h: 12, label: "Explain it to Dennis", onClick: squeakDennis }]}
        />
      </div>
      <div className={styles.dialogue} aria-live="polite">
        {showing ? (
          <>
            <div className={styles.portrait}>
              <Portrait sprite={portraitSprite} />
            </div>
            <div className={styles.line}>
              {name ? (
                <p className={styles.name}>
                  <PixelText text={name} scale={2} />
                  <span className="visually-hidden">{name}:</span>
                </p>
              ) : null}
              <p className={styles.text}>{showing.text}</p>
              <div className={styles.controls}>
                {reaction ? (
                  <Button size="sm" variant="quiet" onClick={onDismissReaction}>
                    {lines.length ? "Back" : "Hide"}
                  </Button>
                ) : null}
                {more ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setIndex((i) => i + 1)}>
                      Next line
                    </Button>
                    <Button size="sm" variant="quiet" onClick={() => setIndex(lines.length - 1)}>
                      Skip
                    </Button>
                  </>
                ) : null}
                {finished ? (
                  <Button size="sm" variant="quiet" onClick={() => setIndex(0)}>
                    Replay
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <p className={styles.quiet}>The rain keeps on. Moss is somewhere inside the radio.</p>
        )}
      </div>
    </section>
  );
}

function sceneLabel(step: Step, client: boolean, clientName?: string, scene = "workshop") {
  if (scene === "lamp-room") return "The lamp room at the top of the lighthouse, at night: the great lens lit, the sea outside, and a small light on the hill.";
  const who = client && clientName ? `, with ${clientName} at the door` : step.type === "pips" ? ", with Pip looking over your shoulder" : "";
  return `The workshop: Moss at his bench and you at your desk${who}. Rain on the window.`;
}
