"use client";

import { useEffect, useState } from "react";
import type { AskStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { defaultLook } from "@/lib/pixel/learner";
import { playSound } from "@/lib/sound";
import { Button, LinkButton } from "../../ui/Button";
import { SceneCanvas, type Actor } from "../../world/SceneCanvas";
import { useNight } from "../../world/useNight";
import { loadIndex } from "../../world/sprites";
import { SCENE_CAST, sceneFor, useEarned, workshopExtras } from "../../world/useWorkshopExtras";
import { useWorkbench } from "../context";
import { Ticket } from "../Ticket";
import { Track } from "@/lib/track";
import styles from "./steps.module.css";
import cs from "./cutscene.module.css";

const WALK_SECONDS = 1.6;
const WALK_DELAY = 0.4;

/**
 * The Ask (REDESIGN.md 5.2): the workshop, the client coming in through the door, their lines in
 * the dialogue box, then the job ticket slides in and pins itself. Skippable, and replayable from the ticket.
 */
export function AskStepView({ step, row }: { step: AskStep; row: StepProgressRow }) {
  const { job, areas, characters, conceptTitles, markPassed, goNext, preview } = useWorkbench();
  const { profile } = useSession();
  const night = useNight();
  const earned = useEarned();
  const [index, setIndex] = useState<{ sprites: Set<string>; scenes: Set<string> } | null>(null);
  const [visiting, setVisiting] = useState(row.status !== "passed");
  const [take, setTake] = useState(0);
  const [pinned, setPinned] = useState(false);
  const client = characters[job.client];
  const clientName = client?.name ?? job.client;

  useEffect(() => {
    void loadIndex().then((i) => setIndex({ sprites: new Set(Object.keys(i.sprites)), scenes: new Set(Object.keys(i.scenes)) }));
  }, []);

  const scene = sceneFor(job.scene, night, index?.scenes);
  const walksIn = job.client !== "moss" && Boolean(index?.sprites.has(client?.sprite ?? job.client)) && scene.startsWith("workshop");

  // The bell over the door, then the walk, then the ticket.
  useEffect(() => {
    if (!visiting || !index) return;
    if (walksIn) playSound("bell", profile.settings.sound);
    const t = setTimeout(() => finish(), (WALK_DELAY + WALK_SECONDS + 1.2) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiting, take, index]);

  const finish = () => {
    setVisiting(false);
    setPinned(true);
  };

  const replay = () => {
    setTake((t) => t + 1);
    setVisiting(true);
    setPinned(false);
    window.dispatchEvent(new CustomEvent("fixwick:replay-dialogue"));
  };

  const start = async () => {
    await markPassed(step.id);
    goNext();
  };

  const actors: Actor[] = [
    { key: "moss", sprite: "moss", anim: "idle", at: "moss" },
    { key: "learner", learner: profile.character ?? defaultLook(), pose: "sit", anim: "sit", at: "learner" },
    { key: "dennis", sprite: "dennis", anim: "idle", at: "dennis" },
  ];
  if (walksIn) {
    actors.push({ key: "client", sprite: client?.sprite ?? job.client, anim: "idle", at: "client", flip: true, ...(visiting ? { from: "door", walk: WALK_SECONDS, delay: WALK_DELAY } : {}) });
  }
  if (scene.startsWith("workshop")) actors.push(...workshopExtras(earned, scene));
  for (const who of SCENE_CAST[scene] ?? []) {
    const spoken = job.steps.some((st) => st.dialogue.some((l) => l.who === who));
    if (spoken && index?.sprites.has(characters[who]?.sprite ?? who)) actors.push({ key: who, sprite: characters[who]?.sprite ?? who, anim: "idle", at: who });
  }

  const label =
    scene === "lamp-room"
      ? "The lamp room at the top of the lighthouse, at night: the great lens lit, the sea outside."
      : walksIn
        ? `The workshop. The bell over the door rings and ${clientName} comes in out of the rain. Moss looks up from his bench.`
        : "The workshop: Moss at his bench and you at your desk. Rain on the window.";

  return (
    <>
      {visiting ? (
        <div className={areas.brief}>
          <div className={cs.pinboard} aria-hidden="true" />
        </div>
      ) : (
        <Ticket full pinIn={pinned}>
          <h2 className={styles.heading}>
            <span className={styles.thisStep}>This step:</span> read the ticket
          </h2>
          {job.conceptsIntroduced.length ? (
            <div className={styles.newIdeas}>
              <h3 className={styles.sub}>New in this job</h3>
              <ul className={styles.chips}>
                {job.conceptsIntroduced.map((c) => (
                  <li key={c}>{conceptTitles[c] ?? c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {preview ? (
            <div className={styles.next}>
              <Track event="view-paywall" />
              <p className={styles.nextNote}>This project is part of Pro. The Ask is a free preview.</p>
              <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
                Get Pro
              </LinkButton>
              <LinkButton href="/map" variant="quiet">
                Not now
              </LinkButton>
            </div>
          ) : (
            <div className={styles.next}>
              <Button variant="primary" onClick={() => void start()}>
                {row.status === "passed" ? "Next step" : "Start the job"}
              </Button>
              <Button variant="quiet" onClick={replay}>
                Watch again
              </Button>
            </div>
          )}
        </Ticket>
      )}
      <div className={areas.stage}>
        <div className={cs.stage}>
          <div className={cs.scene}>
            <SceneCanvas key={take} scene={scene} actors={actors} label={label} maxScale={4} minScale={1} />
          </div>
          {visiting ? (
            <div className={cs.skip}>
              <Button variant="quiet" onClick={finish}>
                Skip
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
