import { Badge } from "../ui/Badge";
import { billSplitter, flaskApp, snake, spamFilter, weatherApp, type FlaskPage, type Project, type TermLine } from "./artefacts";
import styles from "./BuildGrid.module.css";

// "What you'll build" (REDESIGN-2.md 6): real projects, each shown by what it really does,
// in cards of different sizes. The outputs come from the projects' reference solutions.

function Card({ project, line, area, children, wide = false }: { project: Project; line: string; area: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <li className={`${styles.card} ${styles[area]}`}>
      <div className={[styles.artefact, wide ? styles.artefactWide : ""].join(" ")}>{children}</div>
      <div className={styles.caption}>
        <h3 className={styles.name}>{project.title}</h3>
        <p className={styles.line}>{line}</p>
        <p className={styles.meta}>
          <span>Act {project.act}</span>
          {project.free ? <Badge tone="free">Free</Badge> : null}
        </p>
      </div>
    </li>
  );
}

/** A terminal running a program: what it printed, and what was typed at its prompts. */
function Terminal({ command, run, label }: { command: string; run: TermLine[]; label: string }) {
  return (
    <figure className={`code-dark ${styles.terminal}`}>
      <figcaption className="visually-hidden">{label}</figcaption>
      <pre className={styles.termText}>
        <span className={styles.prompt}>$ </span>
        {command}
        {"\n"}
        {run.map((l, i) => (
          <span key={i}>
            {l.out}
            {l.typed ? <span className={styles.typed}>{l.typed}</span> : null}
            {"\n"}
          </span>
        ))}
      </pre>
    </figure>
  );
}

/**
 * The page the Flask app serves, drawn small and as it is: its own plain styles (a serif face,
 * grey rules, a green mark beside a booking), not this site's, because it's the learner's page.
 */
function FlaskView({ page }: { page: FlaskPage }) {
  const doc: React.CSSProperties = { fontFamily: "Georgia, 'Times New Roman', serif", color: "#111", background: "#fff" };
  const rule = "1px solid #ccc";
  return (
    <figure className={styles.web}>
      <div className={styles.webBar} aria-hidden="true">
        <span className={styles.webDots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.webAddress}>127.0.0.1:5000/?date={page.nightIso}</span>
      </div>
      <div className={styles.webPage} style={doc}>
        <p className={styles.webH1}>{page.heading}</p>
        {page.booked ? (
          <p className={styles.webBooked} style={{ borderLeft: "4px solid #374" }}>
            {page.booked}
          </p>
        ) : null}
        <p className={styles.webForm}>
          Night of <span className={styles.webInput}>{page.nightIso.split("-").reverse().join("/")}</span> <span className={styles.webButton}>Show</span>
        </p>
        <p className={styles.webH2}>The night of {page.night}</p>
        <table className={styles.webTable}>
          <thead>
            <tr>
              <th style={{ borderBottom: rule }}>Berth</th>
              <th style={{ borderBottom: rule }}>Longest boat</th>
              <th style={{ borderBottom: rule }}>Who&apos;s in it</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((r) => (
              <tr key={r.berth}>
                <td style={{ borderBottom: rule }}>{r.berth}</td>
                <td style={{ borderBottom: rule }}>{r.longest}</td>
                <td style={{ borderBottom: rule }}>{r.who}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.webH2}>Book a berth</p>
        <div className={styles.webFields}>
          <p className={styles.webForm}>
            Boat <span className={`${styles.webInput} ${styles.webWide}`} />
          </p>
          <p className={styles.webForm}>
            Length in metres <span className={styles.webInput} />
          </p>
          <p className={styles.webForm}>
            Berth{" "}
            <span className={`${styles.webInput} ${styles.webSelect}`}>
              {page.rows[0] ? `${page.rows[0].berth} (up to ${page.rows[0].longest})` : ""}
            </span>
          </p>
          <p className={styles.webForm}>
            Arriving <span className={styles.webInput}>{page.nightIso.split("-").reverse().join("/")}</span>
          </p>
          <p className={styles.webForm}>
            Nights <span className={`${styles.webInput} ${styles.webShort}`}>1</span>
          </p>
          <p className={styles.webForm}>
            <span className={styles.webButton}>Book it</span>
          </p>
        </div>
      </div>
    </figure>
  );
}

/** The spam filter's confusion matrix: each cell shaded by its share of the messages. */
function Matrix({ m }: { m: { spamAsSpam: number; spamAsHam: number; hamAsSpam: number; hamAsHam: number } }) {
  const total = m.spamAsSpam + m.spamAsHam + m.hamAsSpam + m.hamAsHam;
  const precision = m.spamAsSpam / (m.spamAsSpam + m.hamAsSpam);
  const recall = m.spamAsSpam / (m.spamAsSpam + m.spamAsHam);
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  // Shade by a log of the count, so 9 and 16 still read as cells and 940 as the darkest.
  const shade = (n: number) => ({ "--share": `${Math.round((Math.log10(n + 1) / Math.log10(total + 1)) * 62)}%` }) as React.CSSProperties;
  const cell = (n: number) => (
    <td className={styles.cell} style={shade(n)}>
      {n.toLocaleString("en-GB")}
    </td>
  );
  return (
    <figure className={styles.matrix}>
      <table className={styles.matrixTable}>
        <caption className="visually-hidden">Confusion matrix for {total.toLocaleString("en-GB")} test messages</caption>
        <thead>
          <tr>
            <td />
            <th scope="col">Said spam</th>
            <th scope="col">Said not spam</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Spam</th>
            {cell(m.spamAsSpam)}
            {cell(m.spamAsHam)}
          </tr>
          <tr>
            <th scope="row">Not spam</th>
            {cell(m.hamAsSpam)}
            {cell(m.hamAsHam)}
          </tr>
        </tbody>
      </table>
      <figcaption className={styles.matrixStats}>
        <span>
          Precision <strong>{pct(precision)}</strong>
        </span>
        <span>
          Recall <strong>{pct(recall)}</strong>
        </span>
        <span>{total.toLocaleString("en-GB")} messages it never saw</span>
      </figcaption>
    </figure>
  );
}

// A snapshot of a Snake game: head first, then the body, on a 16 by 11 board.
const SNAKE: [number, number][] = [
  [10, 3], [9, 3], [8, 3], [7, 3], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [11, 6], [11, 7], [10, 7], [9, 7], [8, 7], [7, 7], [6, 7], [5, 7], [4, 7], [4, 8],
];
const FOOD: [number, number] = [13, 3];
const COLS = 16;
const ROWS = 11;
const CELL = 20;

function SnakeBoard() {
  const w = COLS * CELL;
  const h = ROWS * CELL;
  const [hx, hy] = SNAKE[0]!;
  return (
    <figure className={`code-dark ${styles.snakeBox}`}>
      <svg viewBox={`0 0 ${w} ${h + 28}`} className={styles.snakeSvg} role="img" aria-label={`A game of Snake: the snake is ${SNAKE.length} squares long and heading right for the food. Score ${SNAKE.length - 3}.`}>
        <text x="2" y="16" className={styles.score}>
          Score {SNAKE.length - 3}
        </text>
        <g transform="translate(0 28)">
          <rect width={w} height={h} rx="4" className={styles.board} />
          {SNAKE.slice(1).map(([x, y], i) => (
            <rect key={i} x={x * CELL + 1.5} y={y * CELL + 1.5} width={CELL - 3} height={CELL - 3} rx="3" className={styles.body} />
          ))}
          <rect x={hx * CELL + 1} y={hy * CELL + 1} width={CELL - 2} height={CELL - 2} rx="4" className={styles.head} />
          <circle cx={hx * CELL + 13} cy={hy * CELL + 6} r="2" className={styles.eye} />
          <circle cx={hx * CELL + 13} cy={hy * CELL + 14} r="2" className={styles.eye} />
          <circle cx={FOOD[0] * CELL + CELL / 2} cy={FOOD[1] * CELL + CELL / 2} r={CELL / 2 - 3} className={styles.food} />
        </g>
      </svg>
    </figure>
  );
}

export function BuildGrid() {
  const bill = billSplitter();
  const weather = weatherApp();
  const flask = flaskApp();
  const spam = spamFilter();
  const game = snake();
  return (
    <ul className={styles.grid}>
      <Card project={bill.project} line="Splits a bill and the tip between a table of people, to the penny." area="bill">
        <Terminal command="python main.py" run={bill.run} label="The Bill Splitter running in a terminal" />
      </Card>
      <Card project={weather.project} line="A three-day forecast for anywhere, from a real weather service." area="weather" wide>
        <Terminal command="python weather.py" run={weather.run} label="The Weather App running in a terminal" />
      </Card>
      <Card project={flask.project} line="A Flask web app: pages, a booking form, a JSON API and its own tests." area="flask" wide>
        <FlaskView page={flask.page} />
      </Card>
      <Card project={spam.project} line="Naive Bayes written from scratch, then tested honestly." area="spam">
        <Matrix m={spam.matrix} />
      </Card>
      <Card project={game.project} line="A real-time game loop: the snake, the food, the walls and the score." area="snake">
        <SnakeBoard />
      </Card>
    </ul>
  );
}
