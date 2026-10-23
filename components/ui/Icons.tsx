// The only icons in the product: they carry meaning (run, stop, pass, fail).
const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true } as const;

export const RunIcon = () => (
  <svg {...common}>
    <path d="M4 2.5v11l9-5.5-9-5.5z" fill="currentColor" />
  </svg>
);

export const StopIcon = () => (
  <svg {...common}>
    <rect x="3.5" y="3.5" width="9" height="9" fill="currentColor" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...common}>
    <path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export const PassIcon = () => (
  <svg {...common}>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);

export const FailIcon = () => (
  <svg {...common}>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const DotIcon = () => (
  <svg {...common}>
    <circle cx="8" cy="8" r="3" fill="currentColor" />
  </svg>
);
