export const CAGE_COLORS = [
  "#fecdd3",
  "#bae6fd",
  "#bbf7d0",
  "#fde68a",
  "#ddd6fe",
  "#fbcfe8",
  "#a5f3fc",
  "#d9f99d",
  "#fed7aa",
  "#c7d2fe",
  "#99f6e4",
  "#f5d0fe",
];

export const BOARD_THEMES = {
  default: {
    "--cell-bg": "#f1f5f9",
    "--cell-bg-selected": "#38bdf8",
    "--cell-bg-highlight": "#cbd5e1",
    "--cell-bg-same-value": "#86efac",
  },
  light: {
    "--cell-bg": "#ffffff",
    "--cell-bg-selected": "#93c5fd",
    "--cell-bg-highlight": "#e5e7eb",
    "--cell-bg-same-value": "#bbf7d0",
  },
  classicPaper: {
    "--cell-bg": "#fef3c7",
    "--cell-bg-selected": "#f59e0b",
    "--cell-bg-highlight": "#fde68a",
    "--cell-bg-same-value": "#d9f99d",
  },
  highContrast: {
    "--cell-bg": "#ffffff",
    "--cell-bg-selected": "#000000",
    "--cell-bg-highlight": "#d4d4d4",
    "--cell-bg-same-value": "#22c55e",
  },
} as const;
