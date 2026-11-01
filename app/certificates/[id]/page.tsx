import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, siteUrl } from "@/lib/brand";
import { getCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";
import { Page } from "@/components/site/Page";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CERTIFICATE_SIZE, actName, certificateUrl } from "@/components/certificates/CertificateImage";
import { longDate } from "@/components/certificates/og";
import styles from "@/components/certificates/Certificate.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return { title: "Not found" };
  const title = `${c.name} completed Act ${c.actNumber} of ${BRAND.name}`;
  return { title, description: `${actName(c)}: ${c.projects} projects shipped.`, openGraph: { title, images: [{ url: `/certificates/${c.id}/image`, ...CERTIFICATE_SIZE }] } };
}

/** The public verification page (REDESIGN.md 9.2): anyone with the link can check it's real. */
export default async function CertificatePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) notFound();
  const url = certificateUrl(c, siteUrl());
  const issued = new Date(c.issuedAt);
  const act = actName(c);
  const linkedIn = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${BRAND.name}: Act ${c.actNumber}, ${act}`,
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
        <img
          className={styles.image}
          src={`/certificates/${c.id}/image`}
          width={CERTIFICATE_SIZE.width}
          height={CERTIFICATE_SIZE.height}
          alt={`${BRAND.name} certificate: ${c.name} completed Act ${c.actNumber}, ${act}, with ${c.projects} projects shipped. Issued ${longDate(c.issuedAt)}.`}
        />
        <section className={styles.verify} aria-labelledby="verify-title">
          <p className={styles.status}>
            <Icon name="tick" size={24} />
            Verified certificate
          </p>
          <h1 id="verify-title" className={styles.title}>
            {c.name}
          </h1>
          <p className={styles.what}>
            Completed Act {c.actNumber} of {BRAND.name}, {act}, shipping {c.projects} projects.
          </p>
          <dl className={styles.facts}>
            <div>
              <dt className="label">Issued</dt>
              <dd>{longDate(c.issuedAt)}</dd>
            </div>
            <div>
              <dt className="label">Certificate</dt>
              <dd className={styles.id}>{c.id}</dd>
            </div>
          </dl>
          <div className={styles.row}>
            <LinkButton href={linkedIn} target="_blank" rel="noopener noreferrer" variant="primary">
              Add to LinkedIn
            </LinkButton>
            <LinkButton href={`/certificates/${c.id}/image?download`} download icon="download">
              Download PNG
            </LinkButton>
            <LinkButton href={`/certificates/${c.id}/pdf`} icon="download">
              Download PDF
            </LinkButton>
          </div>
        </section>
      </div>
    </Page>
  );
}
