"use client";

// /friends: your friends and requests, and asking someone by username. /friends?u=<username>
// is a friend's profile and Shelf; /friends?u=<username>&p=<project> opens one of their shipped
// projects to read and run. A friend sees only what you've shipped (lib/friends.ts).
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Files } from "@/lib/python/protocol";
import type { ShareCourse } from "@/lib/content/share-course";
import { CAST_IDS, castColour, floorFor } from "@/lib/cast";
import { isCast } from "@/lib/playas";
import { avatarBackground } from "@/lib/pixel/looks";
import { oneOf } from "@/lib/moments";
import type { Expression } from "@/lib/pixel/people";
import { useSession } from "@/lib/store/session";
import { answerFriend, askFriend, friendCode, friendProfile, myFriends, removeFriend, type AskResult, type Friend, type FriendProfile } from "@/lib/friends";
import { PixelPerson } from "../art/PixelPerson";
import { ShelfObject } from "../art/ShelfObject";
import { Button } from "../ui/Button";
import { copyText } from "../classes/LinkBox";
import { ClassLine } from "../classes/shared";
import { SharedProjectView } from "../share/SharedProject";
import { useData } from "../share/ShareView";
import teach from "../teach/Teach.module.css";
import classes from "../classes/Classes.module.css";
import shelf from "../profile/PublicShelf.module.css";

const PLEASED: Expression[] = ["pleased", "laughing", "proud", "excited", "relieved"];

const ASKED: Record<AskResult, string> = {
  sent: "Sent, it's on their Friends page now waiting for them to accept.",
  accepted: "They'd already asked you, so you're friends now.",
  already: "You're friends already.",
  pending: "You've asked them already, it's just waiting on them now.",
  "not-found": "Nobody has that username, so check the spelling with them.",
  self: "That's you.",
  "signed-out": "Log in again first.",
};

/** A person's face: the classmate they play as, or their own look. */
function Face({ character, playAs, name, size = "small" }: { character: unknown; playAs: string | null; name: string; size?: "small" | "big" }) {
  const cast = isCast(playAs) ? playAs : null;
  const background = cast ? castColour(cast).face : avatarBackground(character);
  if (size === "big")
    return (
      <span className={`px-panel ${shelf.avatar}`} style={{ background }}>
        <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : character} crop="bust" scale={3} expression="pleased" label={`${name}'s look`} />
      </span>
    );
  return (
    <span className={teach.face} style={{ background }} aria-hidden="true">
      <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : character} crop="head" scale={1} animate={false} />
    </span>
  );
}

export function Friends({ course, names }: { course: ShareCourse; names: Record<string, string> }) {
  const params = useSearchParams();
  const who = params.get("u");
  const project = params.get("p");
  if (who && project) return <FriendProject key={`${who}/${project}`} username={who} jobId={project} course={course} />;
  if (who) return <FriendShelf key={who} username={who} course={course} names={names} />;
  return <FriendList names={names} />;
}

// ---------------------------------------------------------------- your friends

function FriendList({ names }: { names: Record<string, string> }) {
  const { username } = useSession();
  const [list, setList] = useState<Friend[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [ask, setAsk] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setList(await myFriends());
      setProblem(null);
    } catch {
      setProblem("Couldn't load your friends. Check your connection and reload the page.");
    }
  }, []);
  useEffect(() => void load(), [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = ask.trim().replace(/^@/, "").toLowerCase();
    if (!name || busy) return;
    setBusy(true);
    try {
      const result = await askFriend(name);
      setNote(ASKED[result] ?? "Done.");
      if (result === "sent" || result === "accepted") setAsk("");
      await load();
    } catch {
      setNote("That didn't send, give it another go in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn: () => Promise<unknown>, said: string) => {
    try {
      await fn();
      // The lists first, then the line: what it says is already true on screen.
      await load();
      setConfirming(null);
      setNote(said);
    } catch {
      setNote("That didn't work, give it another go in a moment.");
    }
  };

  const incoming = (list ?? []).filter((f) => f.status === "pending" && f.incoming);
  const outgoing = (list ?? []).filter((f) => f.status === "pending" && !f.incoming);
  const friends = (list ?? []).filter((f) => f.status === "accepted");

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <h1 className={teach.title}>Friends</h1>
        <ClassLine who="neil" names={names} text="Add your friends by their username, then you can look round each other's Shelves." />
      </header>

      <section className={`px-panel ${teach.section}`} aria-labelledby="add-title">
        <h2 id="add-title" className={teach.h2}>
          Add a friend
        </h2>
        {username ? (
          <p className={teach.meta}>
            Your username is <strong>@{username}</strong>, so give it to your friends and they can add you.{" "}
            <button type="button" className={teach.copy} onClick={() => void copyText(username).then((ok) => setNote(ok ? "Copied your username." : "Copy it from the page instead."))}>
              Copy it
            </button>
          </p>
        ) : null}
        <form className={classes.addRow} onSubmit={send}>
          <div className={[teach.field, classes.fieldGrow].join(" ")}>
            <label htmlFor="friend-name" className="label">
              Their username
            </label>
            <input id="friend-name" value={ask} onChange={(e) => setAsk(e.target.value)} autoCapitalize="none" autoComplete="off" spellCheck={false} maxLength={21} placeholder="caitlin_b" />
          </div>
          <Button type="submit" icon="users" disabled={busy || !ask.trim()}>
            {busy ? "Sending" : "Ask them"}
          </Button>
        </form>
        <p className={classes.status} role="status" aria-live="polite">
          {note}
        </p>
      </section>

      {problem ? (
        <p className={teach.error} role="alert">
          {problem}
        </p>
      ) : null}

      {incoming.length ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="asks-title">
          <h2 id="asks-title" className={teach.h2}>
            Asking to be your friend
          </h2>
          <ul className={classes.setList}>
            {incoming.map((f) => (
              <li key={f.id} className={classes.setItem}>
                <div className={teach.who}>
                  <Face character={f.character} playAs={f.playAs} name={f.displayName} />
                  <span className={teach.whoText}>
                    <span className={teach.strong}>{f.displayName}</span>
                    <span className={teach.meta}>@{f.username}</span>
                  </span>
                </div>
                <div className={classes.setSide}>
                  <Button size="sm" variant="primary" onClick={() => void act(() => answerFriend(f.id, true), `You and ${f.displayName} are friends now.`)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void act(() => answerFriend(f.id, false), `Turned down, but ${f.displayName} won't be told.`)}>
                    Not now
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`px-panel ${teach.section}`} aria-labelledby="friends-title">
        <h2 id="friends-title" className={teach.h2}>
          Your friends
        </h2>
        {list === null && !problem ? (
          <p className={teach.empty}>Loading.</p>
        ) : friends.length === 0 ? (
          <p className={teach.empty}>No friends here yet, but you can ask someone by their username above.</p>
        ) : (
          <ul className={classes.setList}>
            {friends.map((f) => (
              <li key={f.id} className={classes.setItem}>
                <Link href={`/friends?u=${encodeURIComponent(f.username)}`} className={teach.who}>
                  <Face character={f.character} playAs={f.playAs} name={f.displayName} />
                  <span className={teach.whoText}>
                    <span className={teach.strong}>{f.displayName}</span>
                    <span className={teach.meta}>@{f.username}</span>
                  </span>
                </Link>
                <div className={classes.setSide}>
                  {confirming === f.id ? (
                    <span className={classes.inlineConfirm}>
                      <span>Unfriend {f.displayName}?</span>
                      <Button size="sm" variant="danger" onClick={() => void act(() => removeFriend(f.id), `You and ${f.displayName} aren't friends any more.`)}>
                        Unfriend
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                        Keep
                      </Button>
                    </span>
                  ) : (
                    <>
                      <Link href={`/friends?u=${encodeURIComponent(f.username)}`} className={teach.back}>
                        Their Shelf
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(f.id)}>
                        Unfriend
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="sent-title">
          <h2 id="sent-title" className={teach.h2}>
            Waiting for them
          </h2>
          <ul className={classes.setList}>
            {outgoing.map((f) => (
              <li key={f.id} className={classes.setItem}>
                <div className={teach.who}>
                  <Face character={f.character} playAs={f.playAs} name={f.displayName} />
                  <span className={teach.whoText}>
                    <span className={teach.strong}>{f.displayName}</span>
                    <span className={teach.meta}>@{f.username}</span>
                  </span>
                </div>
                <div className={classes.setSide}>
                  <Button size="sm" variant="ghost" onClick={() => void act(() => removeFriend(f.id), `Taken back, ${f.displayName} won't see it now.`)}>
                    Take it back
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- a friend's Shelf

function useFriend(username: string) {
  const [state, setState] = useState<{ profile: FriendProfile | null; loaded: boolean; failed: boolean }>({ profile: null, loaded: false, failed: false });
  useEffect(() => {
    let gone = false;
    friendProfile(username)
      .then((profile) => !gone && setState({ profile, loaded: true, failed: false }))
      .catch(() => !gone && setState({ profile: null, loaded: true, failed: true }));
    return () => {
      gone = true;
    };
  }, [username]);
  return state;
}

function NotFriends({ username, failed }: { username: string; failed: boolean }) {
  return (
    <section className={`px-panel ${teach.section}`} aria-labelledby="not-title">
      <h1 id="not-title" className={teach.h2}>
        {failed ? "That didn't load" : `@${username} isn't your friend yet`}
      </h1>
      <p className={teach.meta}>{failed ? "Check your connection and reload the page." : "You can see someone's Shelf once you're friends, so ask them from your Friends page."}</p>
      <Link href="/friends" className={teach.back}>
        Back to your friends
      </Link>
    </section>
  );
}

function FriendShelf({ username, course, names }: { username: string; course: ShareCourse; names: Record<string, string> }) {
  const { profile, loaded, failed } = useFriend(username);
  const acts = useMemo(() => {
    const byAct = new Map<number, { number: number; title: string; items: { jobId: string; name: string; clientId: string; client: string }[] }>();
    for (const s of profile?.shipped ?? []) {
      const info = course[s.jobId];
      if (!info) continue;
      if (!byAct.has(info.act)) byAct.set(info.act, { number: info.act, title: info.actName, items: [] });
      byAct.get(info.act)!.items.push({ jobId: s.jobId, name: info.name, clientId: info.clientId, client: info.client });
    }
    return [...byAct.values()].sort((a, b) => a.number - b.number);
  }, [profile, course]);

  if (!loaded) return <p className={teach.empty}>Loading.</p>;
  if (!profile) return <NotFriends username={username} failed={failed} />;
  const shippedCount = profile.shipped.length;
  const cast = isCast(profile.playAs) ? profile.playAs : null;
  const playing = cast && (names[cast] ?? cast).toLowerCase() !== profile.displayName.toLowerCase() ? `, playing as ${names[cast] ?? cast}` : "";

  return (
    <div className={shelf.layout}>
      <p>
        <Link href="/friends" className={teach.back}>
          Back to your friends
        </Link>
      </p>
      <header className={shelf.who}>
        <Face character={profile.character} playAs={profile.playAs} name={profile.displayName} size="big" />
        <div className={shelf.text}>
          <h1 className={shelf.name}>{profile.displayName}</h1>
          <p className={shelf.line}>
            @{profile.username}
            {playing}
            {shippedCount === 0 ? ", with nothing shipped yet." : `, with ${shippedCount} ${shippedCount === 1 ? "project" : "projects"} shipped.`}
          </p>
        </div>
      </header>
      {acts.length === 0 ? (
        <p className={shelf.meta}>Nothing on their Shelf yet, but projects turn up here as they ship them.</p>
      ) : (
        acts.map((act) => (
          <section key={act.number} className={shelf.act} aria-labelledby={`act-${act.number}`}>
            <h2 id={`act-${act.number}`} className={shelf.actTitle}>
              <span className={shelf.marker} style={{ background: castColour(floorFor(act.number)?.residents[0] ?? "").face }} aria-hidden="true" />
              Act {act.number}: {act.title}
            </h2>
            <ul className={shelf.grid}>
              {act.items.map((i) => (
                <li key={i.jobId}>
                  <Link href={`/friends?u=${encodeURIComponent(profile.username)}&p=${encodeURIComponent(i.jobId)}`} className={["px-panel", shelf.card, shelf.link].join(" ")}>
                    {(CAST_IDS as readonly string[]).includes(i.clientId) ? (
                      <span className={shelf.client} style={{ background: castColour(i.clientId).face }} aria-hidden="true">
                        <PixelPerson who={i.clientId} crop="head" scale={2} expression={oneOf(PLEASED, `${profile.username}|${i.jobId}`)} />
                      </span>
                    ) : (
                      <ShelfObject jobId={i.jobId} title={i.name} client={i.clientId} size={64} />
                    )}
                    <span className={shelf.cardText}>
                      <span className={shelf.project}>{i.name}</span>
                      <span className={shelf.meta}>For {i.client}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------- one of their projects

function FriendProject({ username, jobId, course }: { username: string; jobId: string; course: ShareCourse }) {
  const router = useRouter();
  const { profile, loaded, failed } = useFriend(username);
  const info = course[jobId];
  const { data } = useData(jobId, Boolean(info?.data));
  const [files, setFiles] = useState<Files | null>(null);
  const shipped = profile?.shipped.find((s) => s.jobId === jobId) ?? null;

  useEffect(() => {
    if (!profile || !shipped) return;
    let gone = false;
    friendCode(username, jobId)
      .then((all) => {
        if (gone) return;
        // The shipped program is the step the project ships from; failing that, the latest step's files.
        const fromStep = info?.shipsFrom ? all.filter((f) => f.stepId === info.shipsFrom) : [];
        const latest = [...all].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.stepId;
        const chosen = fromStep.length ? fromStep : all.filter((f) => f.stepId === latest);
        setFiles(Object.fromEntries(chosen.map((f) => [f.filename, f.content])));
      })
      .catch(() => !gone && setFiles({}));
    return () => {
      gone = true;
    };
  }, [profile, shipped, username, jobId, info?.shipsFrom]);

  if (!loaded) return <p className={teach.empty}>Loading.</p>;
  if (!profile) return <NotFriends username={username} failed={failed} />;
  const back = (
    <Button variant="ghost" size="sm" icon="caretLeft" onClick={() => router.push(`/friends?u=${encodeURIComponent(username)}`)}>
      Back to {profile.displayName}&apos;s Shelf
    </Button>
  );
  if (!shipped)
    return (
      <section className={`px-panel ${teach.section}`}>
        {back}
        <p className={teach.meta}>{profile.displayName} hasn&apos;t shipped that one yet.</p>
      </section>
    );
  if (files === null) return <p className={teach.empty}>Loading their code.</p>;
  const entry = info?.entry && files[info.entry] !== undefined ? info.entry : (Object.keys(files)[0] ?? "main.py");
  return (
    <SharedProjectView
      name={profile.displayName}
      character={profile.character}
      playAs={isCast(profile.playAs) ? profile.playAs : null}
      jobId={jobId}
      projectName={info?.name ?? jobId}
      clientId={info?.clientId ?? ""}
      client={info?.client ?? "a classmate"}
      actLabel={info ? `Act ${info.act}, ${info.actName}` : "A project from another version of the course"}
      files={files}
      entry={entry}
      data={data}
      shippedAt={shipped.shippedAt}
      note={Object.keys(files).length ? null : "There's no code saved for this one, because it was built on their own computer."}
      back={back}
    />
  );
}
