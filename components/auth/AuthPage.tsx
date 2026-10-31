import { Suspense } from "react";
import { Page } from "../site/Page";
import { Mark } from "../site/Brand";
import { AuthForm } from "./AuthForm";
import styles from "./AuthPage.module.css";

/** Sign up and log in (REDESIGN-2.md 6): one clean card in the middle of the page. */
export function AuthPage({ mode }: { mode: "signup" | "login" }) {
  return (
    <Page narrow>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <Mark size={40} />
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
