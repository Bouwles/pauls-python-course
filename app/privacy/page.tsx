import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Doc } from "@/components/legal/Doc";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <Page narrow>
      <Doc title="Privacy" lede={`What ${BRAND.name} keeps about you, why, and how to take it back.`} draft>
        <h2>What we keep</h2>
        <ul>
          <li>Your email address, so you can log in.</li>
          <li>The display name and avatar you choose.</li>
          <li>Your work: the code you write in each step, earlier versions of it, your answers, hints used, time spent on each step, your review deck and its history.</li>
          <li>Simple usage events (a step started, a step passed, a hint used) so we can see where the course is too hard or too easy. They are stored with the rest of your data, not sent to anyone else.</li>
        </ul>
        <h2>What we don&apos;t do</h2>
        <ul>
          <li>No advertising, no ad trackers, no selling or sharing your data.</li>
          <li>No cookies except the one that keeps you logged in.</li>
          <li>Your code runs in your own browser. It is sent to our server only to be saved for you.</li>
        </ul>
        <h2>Where it lives</h2>
        <p>Your data is stored by our database provider (currently Supabase) and on your own device, so you can keep working offline.</p>
        <h2>Age</h2>
        <p>You need to be 13 or older to make an account. If you are under 16, please check with a parent or guardian first: in some countries the law asks for their consent.</p>
        <h2>Taking it back</h2>
        <p>In Settings you can download everything we hold about you as a file, and you can delete your account. Deleting removes your data from our database straight away.</p>
        <h2>Contact</h2>
        <p>Ask Paul.</p>
      </Doc>
    </Page>
  );
}
