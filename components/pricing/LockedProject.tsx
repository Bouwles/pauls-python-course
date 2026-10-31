import { BRAND } from "@/lib/brand";
import { getIndex } from "@/lib/content/server";
import { Page } from "../site/Page";
import { LinkButton } from "../ui/Button";
import { Track } from "@/lib/track";
import { GateCard } from "./GateCard";

/** A Pro project opened without Pro: what it is, what Pro is, and no nagging (REDESIGN-2.md 6). */
export function LockedProject({ title, actTitle, actNumber }: { title: string; actTitle: string; actNumber: number }) {
  const act = getIndex().acts.find((a) => a.number === actNumber);
  const job = act?.jobs.find((j) => j.title === title);
  const subject = act?.subject ?? actTitle;
  return (
    <Page narrow>
      <Track event="view-paywall" />
      <GateCard
        act={actNumber}
        subject={subject}
        kicker={job && act ? `Act ${actNumber}, project ${job.number} of ${act.jobs.filter((j) => !j.sidequest && !j.placementFor).length}` : `Act ${actNumber}, ${actTitle}`}
        title={title}
        titleId="locked-title"
        actions={
          <>
            <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
              Get Pro
            </LinkButton>
            <LinkButton href="/map" variant="secondary">
              Not now
            </LinkButton>
          </>
        }
      >
        {job?.summary ? <p>{job.summary}</p> : null}
        <p>
          It&apos;s part of {BRAND.name} Pro, with every project on this floor and the floors above it. Act I is free, and everything you&apos;ve made stays yours whatever you decide.
        </p>
      </GateCard>
    </Page>
  );
}
