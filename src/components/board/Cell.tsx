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
    bg = cageInfo ? `color-mix(in srgb, ${cageInfo.color} 12%, rgba(148,163,184,0.08))` : "var(--cell-bg-highlight)";
  } else if (cageInfo) {
    bg = `color-mix(in srgb, ${cageInfo.color} 10%, transparent)`;
  } else {
    bg = "var(--cell-bg)";
  }

  let textColor: string;
  if (isSelected) textColor = "var(--cell-text-selected)";
  else if (isMistake || isConflict) textColor = "var(--cell-text-mistake)";
  else if (isInitial) textColor = "var(--cell-text-initial)";
  else textColor = "var(--cell-text-placed)";

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
            borderTop: cageInfo.borderTop ? `1.5px dashed color-mix(in srgb, ${cageInfo.color} 55%, transparent)` : "none",
            borderRight: cageInfo.borderRight ? `1.5px dashed color-mix(in srgb, ${cageInfo.color} 55%, transparent)` : "none",
            borderBottom: cageInfo.borderBottom ? `1.5px dashed color-mix(in srgb, ${cageInfo.color} 55%, transparent)` : "none",
            borderLeft: cageInfo.borderLeft ? `1.5px dashed color-mix(in srgb, ${cageInfo.color} 55%, transparent)` : "none",
          }}
        />
      )}

      {cageInfo?.isLabel && (
        <span
          className="pointer-events-none absolute top-[1px] left-[3px] font-bold leading-none"
          style={{
            fontSize: "clamp(7px, calc(var(--cell-size) * 0.19), 10px)",
            color: `color-mix(in srgb, ${cageInfo.color} 80%, white)`,
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
