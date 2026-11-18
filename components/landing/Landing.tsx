import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { FLOORS } from "@/lib/cast";
import { Portrait } from "@/components/art/Portrait";
import { TowerOverview } from "@/components/clocktower/TowerOverview";
import { LinkButton } from "@/components/ui/Button";
import { ACCOUNTS } from "@/lib/supabase/project";
import { ClassScene } from "./ClassScene";
import { MeetTheClass } from "./MeetTheClass";
import type { LandingData } from "./data";
import briefShot from "@/public/landing/brief.png";
import lessonShot from "@/public/landing/lesson.png";
import fixShot from "@/public/landing/fix.png";
import shelfShot from "@/public/landing/shelf.png";
import classShot from "@/public/landing/class.png";
import certificateShot from "@/public/landing/certificate.png";
import styles from "./Landing.module.css";

// The landing page, for someone who has never been here: what the course is, how a project goes,
// the nine floors, the people in it, and the way in. Everything it counts comes from the content
// at build time (landingData() in ./data.ts), so it can sit on any page: /about, or the home page
// for visitors who aren't signed in. Fully static: the only moving parts are the class's own.

const WORDS: Record<number, string> = { 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve" };
const word = (n: number) => WORDS[n] ?? String(n);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "A, B and C". */
function list(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? "");
}

interface Step {
  name: string;
  title: string;
  text: React.ReactNode;
  shot?: { src: StaticImageData; alt: string };
}

export function Landing({ data }: { data: LandingData }) {
  const { acts, names, totalProjects, writtenProjects, totalHours, firstProject } = data;
  const n = (id: string) => names[id] ?? capital(id);
  const floors = word(acts.length);
  const subjects = Object.fromEntries(acts.map((a) => [a.number, a.subject]));
  const firstAct = acts[0];
  const topDown = [...acts].reverse();

  const steps: Step[] = [
    {
      name: "The brief",
      title: "Someone in the class needs a program",
      text: (
        <>
          {n("caitlin")} has picked the restaurant for class dinner. There are six of us and one bill, and last time it took twenty minutes to settle who had the extra garlic bread, so you build her a
          bill splitter.
        </>
      ),
      shot: { src: briefShot, alt: `${n("caitlin")} in the Studio asking for a bill splitter, with ${n("paul")} in the foreground.` },
    },
    {
      name: "Learn",
      title: "Learn the idea, then guess what it prints",
      text: (
        <>
          You pick up the ideas as you go, with short explanations, examples you can run and questions that make you guess what some code will print before you get to run it. When a step only wants you
          to read something, the code next to it is locked, so you can run it but you can&apos;t type in it until a step actually asks you to change something.
        </>
      ),
      shot: { src: lessonShot, alt: "A lesson on print() beside the code editor, with the program's output underneath." },
    },
    {
      name: "Fix it",
      title: "Fix a classmate's bug",
      text: (
        <>
          At some point somebody&apos;s code turns up with a mistake in it. {n("yahya")}&apos;s tip program says a bill of 20 with a 10 per cent tip comes to 20.10, so you find the bug and fix it (and I&apos;ll have something to say about the variable called <code>c</code>).
        </>
      ),
      shot: { src: fixShot, alt: `Fixing ${n("yahya")}'s program, where the output says 20.10 when it should say 22.00 and ${n("paul")} complains about the variable name.` },
    },
    {
      name: "Build it",
      title: "Write it yourself",
      text: (
        <>
          Then you write the program yourself and the tests check it, and if you get stuck there are hints that give away a little more each time, or a rubber duck you can explain the problem to,
          although it won&apos;t answer you.
        </>
      ),
    },
    {
      name: "Ship it",
      title: "Ship it to your Shelf",
      text: (
        <>
          Once the checks pass the program goes on your Shelf, and from there you can download everything as one repository, push it to GitHub or send a friend a link that runs it in their browser.
        </>
      ),
      shot: { src: shelfShot, alt: "The Shelf, with an example run of each program someone has shipped." },
    },
  ];

  const extras = [
    { title: "Morning Rounds", text: "Each idea comes back a day or two after you first use it, then less and less often as it sticks." },
    { title: "Drills", text: `Five quick tasks against the clock, and ${n("yahya")} has set the time to beat on every one of them.` },
    { title: "The Arcade League", text: "A race every week for the crabs you train in Act 8, where everyone's crab runs on the same seeds and the lowest average number of moves wins." },
    {
      title: "Certificates",
      text: "You get one for each Act you finish, and they're proper ones with an engraved border, a gold seal and my signature on them, which you can save as a picture or print on a sheet of A4.",
    },
  ];

  const questions = [
    { q: "What does it cost?", a: "Nothing, every Act is free and so are the certificates." },
    ...(ACCOUNTS
      ? [
          {
            q: "Do I need an account?",
            a: "Yes, but it's free and all it needs is a username, your email and a password. It keeps your work safe on any device, and it's how you add friends, look round their Shelves and join a class.",
          },
        ]
      : []),
    {
      q: "Do I need to install anything?",
      a: "No, Python runs right there in your browser. A few of the later projects need more than a browser can do, like PyTorch and Pygame, so you build those on your own computer and paste the test results back in.",
    },
    {
      q: "Do I need to know any Python first?",
      a: "No, the first project starts with a single print(), and if you already know some Python there's a placement test that can open the early floors for you.",
    },
    {
      q: "How long does it take?",
      a: `About ${totalHours} hours for all ${floors} Acts${firstAct ? `, and about ${firstAct.hours} for the first` : ""}. Every project shows how long it usually takes, and there's no rush.`,
    },
    {
      q: "Is all of it ready?",
      a: `${writtenProjects} of the ${totalProjects} projects are written and ready to play, and the rest are still being written, so the syllabus marks which ones they are.`,
    },
  ];

  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroText}>
          <h1 id="landing-title" className={styles.title}>
            Paul&apos;s Python Course
          </h1>
          <p className={styles.tagline}>A free Python course in your browser, from your first print() to a neural network.</p>
          <p className={styles.lede}>
            I teach Python to my friends, and this is the website for it. You start on the ground floor of an old clocktower printing a sign for the door, and work your way up through {floors} floors and{" "}
            {totalProjects} projects until you&apos;ve written a neural network from scratch, built a tiny GPT and trained a crab to race.
          </p>
          <div className={styles.ctas}>
            <LinkButton href="/signup" variant="primary">
              Sign up
            </LinkButton>
            <LinkButton href="/login" variant="secondary">
              Log in
            </LinkButton>
          </div>
          <p className={styles.small}>
            It&apos;s free and there&apos;s nothing to install. <Link href="/syllabus">Read the syllabus</Link>
          </p>
        </div>
        <div className={styles.heroArt}>
          <ClassScene names={names} greeting="Welcome to the Clocktower, where we build actual programs, and we start with the sign on the front door." />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="landing-project">
        <header className={styles.head}>
          <h2 id="landing-project" className={styles.h2}>
            How a project goes
          </h2>
          <p className={styles.headLede}>Every project starts with one of us needing something, and ends with a real program that does it.</p>
        </header>
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <li key={s.name} className={[styles.step, s.shot ? "" : styles.stepPlain].join(" ")}>
              <div className={styles.stepText}>
                <p className={styles.stepName}>
                  <span className={styles.stepNo} aria-hidden="true">
                    {i + 1}
                  </span>
                  {s.name}
                </p>
                <h3 className={styles.h3}>{s.title}</h3>
                <p className={styles.body}>{s.text}</p>
              </div>
              {s.shot ? (
                <div className={styles.shot}>
                  <Image src={s.shot.src} alt={s.shot.alt} sizes="(max-width: 960px) calc(100vw - 32px), 680px" className={styles.shotImage} />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="landing-tower">
        <header className={styles.head}>
          <h2 id="landing-tower" className={styles.h2}>
            Climb the tower
          </h2>
          <p className={styles.headLede}>
            Each floor of the Clocktower is an Act, with its own room and one of us working in it. The first four floors are Python and computer science, the next four are data science, machine learning,
            deep learning and reinforcement learning, and the roof is for capstone projects.
          </p>
        </header>
        <div className={styles.tower}>
          <div className={styles.towerArt}>
            <TowerOverview subjects={subjects} />
          </div>
          <ol className={styles.floors} aria-label="The Acts, top floor first">
            {topDown.map((a) => {
              const floor = FLOORS.find((f) => f.act === a.number);
              const who = floor?.residents ?? [];
              const everyone = who.length > 2;
              return (
                <li key={a.number} className={styles.floor}>
                  <div className={[styles.floorWho, everyone ? styles.floorAll : ""].join(" ")} aria-hidden="true">
                    {who.map((id) => (
                      <Portrait key={id} who={id} name={n(id)} size={everyone ? 36 : 48} crop="head" animate={false} />
                    ))}
                  </div>
                  <div className={styles.floorText}>
                    <p className={styles.floorAct}>
                      Act {a.number}
                      {floor ? `, ${floor.label.toLowerCase()}` : ""}
                    </p>
                    <h3 className={styles.floorRoom}>
                      {a.room}: {a.subject}
                    </h3>
                    <p className={styles.floorMeta}>
                      {a.projects} projects and about {a.hours} hours
                      {floor && !everyone ? `, on ${list(floor.residents.map(n))}'s floor.` : everyone ? ", on everyone's floor." : "."}
                    </p>
                    {a.examples.length ? <p className={styles.floorBuild}>You build {list(a.examples)}.</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <p className={styles.after}>
          {writtenProjects} of the {totalProjects} projects are written so far, and the rest are on the way. <Link href="/syllabus">See every project in the syllabus</Link>
        </p>
      </section>

      <section className={styles.section} aria-labelledby="landing-class">
        <header className={styles.head}>
          <h2 id="landing-class" className={styles.h2}>
            Meet the class
          </h2>
          <p className={styles.headLede}>
            Everyone in it is a real person. I teach, {n("neil")} helps me out, and {list(["aaesha", "caitlin", "riya", "yahya"].map(n))} bring you the projects, and sometimes their own buggy code. You can
            play as any of us or make your own avatar, and everyone learns the same Python either way, it&apos;s just the story around it that changes.
          </p>
        </header>
        <MeetTheClass names={names} />
      </section>

      <section className={styles.section} aria-labelledby="landing-around">
        <header className={styles.head}>
          <h2 id="landing-around" className={styles.h2}>
            Around the projects
          </h2>
        </header>
        <div className={styles.around}>
          <ul className={styles.extras}>
            {extras.map((e) => (
              <li key={e.title} className={styles.extra}>
                <h3 className={styles.h3}>{e.title}</h3>
                <p className={styles.body}>{e.text}</p>
              </li>
            ))}
          </ul>
          <div className={styles.certificate}>
            <Image
              src={certificateShot}
              alt={`A certificate with a green engraved border and a clocktower at its head, saying ${n("neil")} has completed Act I: Foundations, with a gold seal and ${n("paul")}'s signature.`}
              sizes="(max-width: 960px) calc(100vw - 32px), 520px"
              className={styles.shotImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="landing-teach">
        <div className={styles.teach}>
          <div className={styles.teachText}>
            <h2 id="landing-teach" className={styles.h2}>
              For teachers
            </h2>
            {ACCOUNTS ? (
              <>
                <p className={styles.body}>
                  Make a class, choose which projects to set, and give everyone its six-character code or join link. Once they&apos;ve joined, your register shows each student&apos;s progress, time and code as they
                  work, without anyone having to send you anything.
                </p>
                <p className={styles.body}>Students see what&apos;s set on their desk in the Clocktower, with its due date, until they ship it.</p>
              </>
            ) : (
              <>
                <p className={styles.body}>
                  Make a class, choose which projects to set, and send everyone a join link. When they&apos;ve had a go they send you a progress link, which adds them to your register with their code there
                  for you to read.
                </p>
                <p className={styles.body}>A co-teacher link gives someone else the same class, and you can share the League table the same way.</p>
              </>
            )}
          </div>
          <div className={styles.shot}>
            <Image src={classShot} alt="The class page, with a register of four students showing which of the three set projects each has shipped." sizes="(max-width: 960px) calc(100vw - 32px), 620px" className={styles.shotImage} />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="landing-questions">
        <header className={styles.head}>
          <h2 id="landing-questions" className={styles.h2}>
            Questions
          </h2>
        </header>
        <dl className={styles.questions}>
          {questions.map((q) => (
            <div key={q.q} className={styles.question}>
              <dt className={styles.q}>{q.q}</dt>
              <dd className={styles.a}>{q.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.start} aria-labelledby="landing-start">
        <div className={styles.startText}>
          <h2 id="landing-start" className={styles.h2}>
            Start on the ground floor
          </h2>
          <p className={styles.body}>
            The first project is {firstProject.title}, which is the sign for the Clocktower&apos;s front door and takes about {firstProject.minutes} minutes.
          </p>
        </div>
        <div className={styles.ctas}>
          <LinkButton href="/signup" variant="primary">
            Sign up
          </LinkButton>
          <LinkButton href="/login" variant="secondary">
            Log in
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
