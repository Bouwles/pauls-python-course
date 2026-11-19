import { Suspense } from "react";
import { getIndex } from "@/lib/content/server";
import { ASSISTANT, PROFESSOR } from "@/lib/cast";
import { STATIC } from "@/lib/static";
import { ACCOUNTS } from "@/lib/supabase/project";
import { Page } from "../site/Page";
import { VisitSpeech } from "../site/VisitSpeech";
import { AuthForm } from "./AuthForm";
import { ConfirmLink, ForgotForm, LogInForm, ResetForm, SignUpForm } from "./AccountForms";
import styles from "./AuthPage.module.css";

export type AuthMode = "signup" | "login" | "forgot" | "reset" | "confirm";

// Who says hello at the door: Paul to someone new, Neil to someone coming back, with a greeting
// that's different each visit (VisitSpeech).
const WELCOME = {
  signup: { who: PROFESSOR, text: "Welcome in, grab a seat anywhere you like, we're starting on the ground floor.", face: "pleased", gesture: "wave" },
  login: { who: ASSISTANT, text: "Welcome back, your code's exactly where you left it, bugs and all.", face: "laughing", gesture: "wave" },
  forgot: { who: ASSISTANT, text: "Happens to everyone, Paul resets his about once a term.", face: "laughing", gesture: "shrug" },
  reset: { who: ASSISTANT, text: "Go on, pick something you'll actually remember this time.", face: "pleased", gesture: "point" },
  confirm: { who: PROFESSOR, text: "Nearly there, I just need to check the email is yours.", face: "pleased", gesture: "wave" },
} as const;

const TITLES: Record<AuthMode, { title: string; lede: string }> = {
  signup: { title: "Make an account", lede: "It keeps your code, your Shelf and your friends on any device, and the whole course is free." },
  login: { title: "Log in", lede: "Your work is where you left it." },
  forgot: { title: "A new password", lede: "We'll email you a link to set one." },
  reset: { title: "A new password", lede: "Type it twice and you're back in." },
  confirm: { title: "Confirming your email", lede: "One moment." },
};

/** The form for this page: the Supabase ones on GitHub Pages, the local server's otherwise. */
function Form({ mode }: { mode: AuthMode }) {
  if (ACCOUNTS) {
    if (mode === "signup") return <SignUpForm />;
    if (mode === "login") return <LogInForm />;
    if (mode === "forgot") return <ForgotForm />;
    if (mode === "reset") return <ResetForm />;
    return <ConfirmLink />;
  }
  if (STATIC) return <p className={styles.lede}>Accounts aren&apos;t switched on for this copy of the course yet.</p>;
  return mode === "signup" || mode === "login" ? <AuthForm mode={mode} /> : <p className={styles.lede}>This page is for the online version of the course.</p>;
}

/** Sign up, log in and the rest: one pixel card in the middle, with someone saying hello. */
export function AuthPage({ mode }: { mode: AuthMode }) {
  const hello = WELCOME[mode];
  const words = TITLES[mode];
  const name = getIndex().characters[hello.who]?.name ?? hello.who.charAt(0).toUpperCase() + hello.who.slice(1);
  return (
    <Page narrow>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <VisitSpeech place={mode} who={hello.who} name={name} text={hello.text} face={hello.face} gesture={hello.gesture} size={112} />
          <div className={styles.head}>
            <h1 className={styles.title}>{words.title}</h1>
            <p className={styles.lede}>{words.lede}</p>
          </div>
          <Suspense>
            <Form mode={mode} />
          </Suspense>
        </div>
      </div>
    </Page>
  );
}
