import type { CSSProperties } from "react";

export interface CageInfo {
  cageIndex: number;
  sum: number;
  color: string;
  isLabel: boolean;
  borderTop: boolean;
  borderRight: boolean;
  borderBottom: boolean;
  borderLeft: boolean;
  sumStatus: "incomplete" | "correct" | "incorrect";
}

interface CellProps {
  value: number;
  notes: number[];
  isInitial: boolean;
  isSelected: boolean;
  isSameRow: boolean;
  isSameCol: boolean;
  isSameBox: boolean;
  isSameValue: boolean;
  isMistake: boolean;
  isConflict: boolean;
  onClick: () => void;
  style?: CSSProperties;
  cageInfo?: CageInfo | null;
}

function cageBorder(show: boolean, color: string) {
  return show ? `1.5px dashed color-mix(in srgb, ${color} 75%, transparent)` : "none";
}

export function Cell(props: CellProps) {
  const {
    value,
    notes,
    isInitial,
    isSelected,
    isSameRow,
    isSameCol,
    isSameBox,
    isSameValue,
    isMistake,
    isConflict,
    onClick,
    style,
    cageInfo,
  } = props;

  let bg: string;
  if (isSelected) {
    bg = "var(--cell-bg-selected)";
  } else if (isSameValue) {
    bg = "var(--cell-bg-same-value)";
  } else if (isSameRow || isSameCol || isSameBox) {
    bg = cageInfo ? `color-mix(in srgb, ${cageInfo.color} 28%, rgba(148,163,184,0.08))` : "var(--cell-bg-highlight)";
  } else if (cageInfo) {
    bg = `color-mix(in srgb, ${cageInfo.color} 22%, transparent)`;
  } else {
    bg = "var(--cell-bg)";
  }

  let textColor: string;
  if (isSelected) textColor = "var(--cell-text-selected)";
  else if (isMistake || isConflict) textColor = "var(--cell-text-mistake)";
  else if (isInitial) textColor = "var(--cell-text-initial)";
  else textColor = "var(--cell-text-placed)";

  let sumColor = cageInfo?.color ?? "";
  if (cageInfo?.isLabel) {
    if (cageInfo.sumStatus === "correct") sumColor = "#4ade80";
    else if (cageInfo.sumStatus === "incorrect") sumColor = "#fb7185";
  }

  return (
    <button
      className="relative flex items-center justify-center transition-colors duration-100"
      onClick={onClick}
      style={{
        ...style,
        background: bg,
        width: "var(--cell-size)",
        height: "var(--cell-size)",
      }}
      type="button"
    >
      {cageInfo && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderTop: cageBorder(cageInfo.borderTop, cageInfo.color),
            borderRight: cageBorder(cageInfo.borderRight, cageInfo.color),
            borderBottom: cageBorder(cageInfo.borderBottom, cageInfo.color),
            borderLeft: cageBorder(cageInfo.borderLeft, cageInfo.color),
          }}
        />
      )}

      {cageInfo?.isLabel && (
        <span
          className="pointer-events-none absolute top-[1px] left-[3px] font-bold leading-none"
          style={{
            fontSize: "clamp(7px, calc(var(--cell-size) * 0.19), 10px)",
            color: sumColor,
          }}
        >
          {cageInfo.sum}
        </span>
      )}

      {value !== 0 ? (
        <span
          className="font-semibold"
          style={{
            fontSize: "clamp(16px, calc(var(--cell-size) * 0.42), 22px)",
            color: textColor,
          }}
        >
          {value}
        </span>
      ) : (
        <div
          className="grid h-full w-full grid-cols-3"
          style={{ color: "var(--cell-note-text)", padding: cageInfo?.isLabel ? "8px 1px 1px 1px" : "1px" }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              className="flex items-center justify-center"
              key={n}
              style={{ fontSize: "clamp(6px, calc(var(--cell-size) * 0.17), 9px)" }}
            >
              {notes.includes(n) ? n : ""}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
