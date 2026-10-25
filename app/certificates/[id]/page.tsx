import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, siteUrl } from "@/lib/brand";
import { getCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";
import { Page } from "@/components/site/Page";
import { LinkButton } from "@/components/ui/Button";
import { PixelIcon } from "@/components/ui/PixelIcon";
import styles from "@/components/certificates/Certificate.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return { title: "Not found" };
  const title = `${c.name} completed Act ${c.actNumber} of ${BRAND.name}`;
  return { title, description: `${c.actTitle}: ${c.projects} projects shipped.`, openGraph: { title, images: [{ url: `/certificates/${c.id}/image`, width: 960, height: 680 }] } };
}

/** The public verification page (REDESIGN.md 9.2): anyone with the link can check it's real. */
export default async function CertificatePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) notFound();
  const url = `${siteUrl()}/certificates/${c.id}`;
  const issued = new Date(c.issuedAt);
  const linkedIn = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${BRAND.name}: Act ${c.actNumber}, ${c.actTitle}`,
    organizationName: BRAND.name,
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: url,
    certId: c.id,
  })}`;
  return (
    <Page>
      <div className={styles.page}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`pixel ${styles.image}`} src={`/certificates/${c.id}/image`} width={960} height={680} alt={`${BRAND.name} certificate: ${c.name} completed Act ${c.actNumber}, ${c.actTitle}, with ${c.projects} projects shipped.`} />
        <section className={`frame-panel ${styles.verify}`} aria-labelledby="verify-title">
          <h1 id="verify-title" className={styles.title}>
            <PixelIcon name="tick" /> Verified
          </h1>
          <p>
            {c.name} completed Act {c.actNumber} of {BRAND.name}, {c.actTitle}, shipping {c.projects} projects. Issued {issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
          <p className={styles.id}>Certificate {c.id}</p>
          <div className={styles.row}>
            <LinkButton href={`/certificates/${c.id}/image`} download variant="quiet">
              Download PNG
            </LinkButton>
            <LinkButton href={`/certificates/${c.id}/pdf`} variant="quiet">
              Download PDF
            </LinkButton>
            <LinkButton href={linkedIn} target="_blank" rel="noopener noreferrer" variant="primary">
              Add to LinkedIn
            </LinkButton>
          </div>
        </section>
      </div>
    </Page>
  );
}
