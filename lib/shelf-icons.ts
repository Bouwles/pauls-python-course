// The Shelf object for each project, until the illustrator draws them (REDESIGN-2.md 8.5): a
// Phosphor icon that matches the program. Act I's thirteen are named outright (they're the
// ones the illustrator draws first, art/manifest.json); every other project's is found from
// its id and title.
import type { IconName } from "@/components/ui/Icon";

const ACT_ONE: Record<string, IconName> = {
  "shop-sign": "signpost",
  "bill-splitter": "receipt",
  "reading-tracebacks": "bug",
  "unit-converter": "ruler",
  "password-checker": "password",
  "times-table-trainer": "grid",
  "number-guessing-game": "question",
  "to-do-list": "listChecks",
  "contact-book": "addressBook",
  "grade-calculator": "exam",
  "rock-paper-scissors": "scissors",
  calculator: "calculator",
  "expense-tracker": "wallet",
};

const RULES: [RegExp, IconName][] = [
  [/sign/, "signpost"],
  [/bill|receipt|till/, "receipt"],
  [/traceback|bug|debug|error/, "bug"],
  [/convert|unit/, "ruler"],
  [/password/, "password"],
  [/times-table|table/, "grid"],
  [/guess|quiz/, "question"],
  [/to-do|todo|habit|task|schedul/, "listChecks"],
  [/contact|address/, "addressBook"],
  [/grade|exam|score|marks/, "exam"],
  [/rock-paper|scissors/, "scissors"],
  [/calculator|arithmetic/, "calculator"],
  [/expense|budget|finance|bank|money|loan|account/, "wallet"],
  [/python-at-home|terminal|command-line|cli/, "terminal"],
  [/weather|forecast|rain|climate/, "cloudSun"],
  [/scrap|web|flask|site|deploy|app/, "globe"],
  [/snake|shooter|arcade|game|crab|league|tic-tac|cartpole|maze|gridworld|race|championship/, "gamepad"],
  [/spam|email|message|sentiment|chat|bot|gpt|language|text|word/, "chat"],
  [/house|price/, "house"],
  [/iris|penguin|flower|nearest/, "flower"],
  [/tree|forest|boost/, "tree"],
  [/graph|route|path|dijkstra|network/, "path"],
  [/search|autocomplete|spell/, "search"],
  [/sort/, "sort"],
  [/hash|map/, "key"],
  [/stack|undo|queue/, "stack"],
  [/neural|neuron|brain|backprop|autograd|engine|learning-backwards/, "brain"],
  [/image|digit|vision|seeing|photo|lighthouse-photo/, "image"],
  [/data|csv|clean|pandas|array|numpy|statistic|chart|plot|dashboard|story|investigation/, "chartBar"],
  [/file|folder|organis/, "folder"],
  [/test/, "shield"],
  [/git|version/, "code"],
  [/model|predict|regression|classif|segment|cluster|recommend|bias|fair/, "robot"],
  [/clock|radio|capstone|portfolio|interview|readiness/, "star"],
];

export function shelfIcon(jobId: string, title = ""): IconName {
  if (Object.hasOwn(ACT_ONE, jobId)) return ACT_ONE[jobId]!;
  const key = `${jobId} ${title}`.toLowerCase();
  for (const [re, icon] of RULES) if (re.test(key)) return icon;
  return "package";
}
