// One icon set (REDESIGN-2.md 2.6): Phosphor, regular weight, 20 px. Icons only where they
// help. Phosphor has no duck and no crab, so those two are drawn here on Phosphor's grid
// (256 units, 16-unit round strokes) to match the rest.
import {
  AddressBook,
  Archive,
  ArrowCounterClockwise,
  ArrowRight,
  Article,
  BookOpenText,
  Books,
  Brain,
  Bug,
  Building,
  Calculator,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChalkboardTeacher,
  ChartBar,
  ChartLine,
  ChatCircleText,
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  ClockCounterClockwise,
  CloudCheck,
  CloudSlash,
  CloudSun,
  Code,
  Coffee,
  Coins,
  Copy,
  Cpu,
  Database,
  DotsThree,
  DownloadSimple,
  Envelope,
  Exam,
  FileCsv,
  FileText,
  Flag,
  Flower,
  Footprints,
  Folder,
  Function,
  GameController,
  GearSix,
  GithubLogo,
  Globe,
  GraduationCap,
  Graph,
  GridFour,
  HandFist,
  House,
  Image,
  Key,
  Keyboard,
  Lightbulb,
  Lightning,
  List,
  ListChecks,
  Lock,
  MagnifyingGlass,
  MapPin,
  Medal,
  Minus,
  Moon,
  Notebook,
  Package,
  Pause,
  Password,
  Path,
  Plant,
  Play,
  PuzzlePiece,
  Question,
  Queue,
  Receipt,
  Robot,
  Rocket,
  Ruler,
  Scissors,
  Shield,
  SignOut,
  SidebarSimple,
  Signpost,
  SortAscending,
  Sparkle,
  Stack,
  Star,
  Stop,
  Sun,
  Table,
  Terminal,
  Timer,
  TreeStructure,
  Trophy,
  User,
  Users,
  Wallet,
  Warning,
  Wrench,
  X,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react/dist/lib/types";

function drawn(paths: React.ReactNode) {
  return function Drawn({ size = 20, className, ...rest }: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) {
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
        {paths}
      </svg>
    );
  };
}

/** A rubber duck, side on, facing right. */
const Duck = drawn(
  <>
    <circle cx="150" cy="84" r="40" />
    <path d="M188,90l36,10-34,14" />
    <path d="M118,120C94,104,58,106,32,122c2,54,42,94,98,94,54,0,94-32,94-74,0-16-6-28-18-36" />
    <circle cx="160" cy="76" r="12" fill="currentColor" stroke="none" />
  </>,
);

/** A crab, from the front, claws up. */
const Crab = drawn(
  <>
    <ellipse cx="128" cy="160" rx="64" ry="40" />
    <path d="M108,121l-6-29M148,121l6-29" />
    <circle cx="100" cy="80" r="12" fill="currentColor" stroke="none" />
    <circle cx="156" cy="80" r="12" fill="currentColor" stroke="none" />
    <path d="M70,142L44,112M186,142l26-30" />
    <path d="M44,112c-16-8-20-30-6-42l18,20,8-26c18,10,16,36-2,44" />
    <path d="M212,112c16-8,20-30,6-42l-18,20-8-26c-18,10-16,36,2,44" />
    <path d="M68,176l-32,14M72,192l-24,26M188,176l32,14M184,192l24,26" />
  </>,
);

const ICONS = {
  run: Play,
  check: Check,
  stop: Stop,
  hint: Lightbulb,
  history: ClockCounterClockwise,
  reset: ArrowCounterClockwise,
  keys: Keyboard,
  settings: GearSix,
  shelf: Books,
  map: Building,
  lock: Lock,
  tick: CheckCircle,
  cross: XCircle,
  dash: Minus,
  saved: CloudCheck,
  offline: CloudSlash,
  loader: CircleNotch,
  more: DotsThree,
  next: ArrowRight,
  download: DownloadSimple,
  github: GithubLogo,
  copy: Copy,
  close: X,
  menu: List,
  warning: Warning,
  caretDown: CaretDown,
  caretRight: CaretRight,
  caretLeft: CaretLeft,
  caretUp: CaretUp,
  sidebar: SidebarSimple,
  footprints: Footprints,
  timer: Timer,
  trophy: Trophy,
  user: User,
  signOut: SignOut,
  sun: Sun,
  moon: Moon,
  handbook: BookOpenText,
  teach: ChalkboardTeacher,
  chalkboard: ChalkboardTeacher,
  notebook: Notebook,
  wrench: Wrench,
  puzzle: PuzzlePiece,
  archive: Archive,
  chartLine: ChartLine,
  chartBar: ChartBar,
  cpu: Cpu,
  gamepad: GameController,
  clock: Clock,
  signpost: Signpost,
  ruler: Ruler,
  grid: GridFour,
  question: Question,
  flower: Flower,
  house: House,
  envelope: Envelope,
  search: MagnifyingGlass,
  tree: TreeStructure,
  graph: Graph,
  path: Path,
  receipt: Receipt,
  password: Password,
  listChecks: ListChecks,
  addressBook: AddressBook,
  exam: Exam,
  handFist: HandFist,
  scissors: Scissors,
  wallet: Wallet,
  terminal: Terminal,
  cloudSun: CloudSun,
  globe: Globe,
  robot: Robot,
  brain: Brain,
  package: Package,
  bug: Bug,
  calculator: Calculator,
  sparkle: Sparkle,
  image: Image,
  table: Table,
  fileCsv: FileCsv,
  folder: Folder,
  database: Database,
  key: Key,
  stack: Stack,
  queue: Queue,
  sort: SortAscending,
  function: Function,
  code: Code,
  chat: ChatCircleText,
  lightning: Lightning,
  users: Users,
  medal: Medal,
  flag: Flag,
  plant: Plant,
  coffee: Coffee,
  graduation: GraduationCap,
  article: Article,
  rocket: Rocket,
  shield: Shield,
  coins: Coins,
  mapPin: MapPin,
  fileText: FileText,
  camera: Camera,
  star: Star,
  pause: Pause,
} satisfies Record<string, PhosphorIcon>;

const DRAWN = { duck: Duck, crab: Crab };

export type IconName = keyof typeof ICONS | keyof typeof DRAWN;

export interface IconProps {
  name: IconName;
  size?: number;
  /** Set for an icon that means something on its own; leave out for decoration beside text. */
  label?: string;
  className?: string;
  spin?: boolean;
}

export function Icon({ name, size = 20, label, className, spin }: IconProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  const style: React.CSSProperties = { flex: "none", display: "block", ...(spin ? { animation: "icon-spin 0.9s linear infinite" } : {}) };
  if (name in DRAWN) {
    const D = DRAWN[name as keyof typeof DRAWN];
    return <D size={size} className={className} style={style} focusable="false" {...a11y} />;
  }
  const P = ICONS[name as keyof typeof ICONS];
  return <P size={size} weight="regular" className={className} style={style} focusable="false" {...a11y} />;
}
