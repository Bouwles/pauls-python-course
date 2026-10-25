import { Suspense } from "react";
import { Page } from "../site/Page";
import { AuthForm } from "./AuthForm";
import { DoorScene } from "./DoorScene";
import styles from "./AuthPage.module.css";

export function AuthPage({ mode }: { mode: "signup" | "login" }) {
  return (
    <Page>
      <div className={styles.layout}>
        <div className={`frame-panel ${styles.card}`}>
          <h1 className={styles.title}>{mode === "signup" ? "Take a desk at the workshop" : "Back to the workshop"}</h1>
          <p className={styles.lede}>
            {mode === "signup"
              ? "An account keeps your code, your Shelf and your review deck, on any device. It's free while the course is being built."
              : "Your desk is as you left it."}
          </p>
          <Suspense>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
        <div className={styles.scene}>
          <DoorScene />
        </div>
      </div>
    </Page>
  );
}
