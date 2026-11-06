import { Suspense } from "react";
import { getIndex } from "@/lib/content/server";
import { ASSISTANT, PROFESSOR } from "@/lib/cast";
import { Page } from "../site/Page";
import { VisitSpeech } from "../site/VisitSpeech";
import { AuthForm } from "./AuthForm";
import styles from "./AuthPage.module.css";

// Who says hello at the door: Paul to someone new, Neil to someone coming back, with a greeting
// that's different each visit (VisitSpeech).
const WELCOME = {
  signup: { who: PROFESSOR, text: "Welcome to the class. Pull up a chair: the ground floor is free.", face: "pleased", gesture: "wave" },
  login: { who: ASSISTANT, text: "Welcome back. Your code's exactly where you left it, bugs and all.", face: "laughing", gesture: "wave" },
} as const;

/** Sign up and log in (REDESIGN-2.md 6): one pixel card in the middle, with someone saying hello. */
export function AuthPage({ mode }: { mode: "signup" | "login" }) {
  const hello = WELCOME[mode];
  const name = getIndex().characters[hello.who]?.name ?? hello.who.charAt(0).toUpperCase() + hello.who.slice(1);
  return (
    <Page narrow>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <VisitSpeech place={mode} who={hello.who} name={name} text={hello.text} face={hello.face} gesture={hello.gesture} size={112} />
          <div className={styles.head}>
            <h1 className={styles.title}>{mode === "signup" ? "Make an account" : "Log in"}</h1>
            <p className={styles.lede}>
              {mode === "signup" ? "It keeps your code, your Shelf and your review deck, on any device. Act I is free." : "Your work is where you left it."}
            </p>
          </div>
          <Suspense>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </Page>
  );
}
