/** Grade visualizations — the letter badge and the five-dimension breakdown. */
import type { Grade } from "@/lib/data/types";
import { GRADE_DIMENSIONS } from "@/lib/data/grade";

const SIZES = {
  sm: { box: 24, font: 13, radius: 7 },
  md: { box: 34, font: 18, radius: 9 },
  lg: { box: 48, font: 26, radius: 12 },
  xl: { box: 76, font: 44, radius: 18 },
} as const;

export function GradeBadge({ grade, size = "md" }: { grade: Grade; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span
      title={`Grade ${grade.letter} · score ${grade.score}/100`}
      className="display"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        fontSize: s.font,
        fontWeight: 400,
        lineHeight: 1,
        color: grade.color,
        background: `color-mix(in srgb, ${grade.color} 13%, transparent)`,
        border: `1px solid color-mix(in srgb, ${grade.color} 34%, transparent)`,
        flexShrink: 0,
      }}
    >
      {grade.letter}
    </span>
  );
}

export function GradeBreakdownBars({ grade }: { grade: Grade }) {
  return (
    <div className="flex flex-col gap-2.5">
      {GRADE_DIMENSIONS.map((d) => {
        const v = grade.breakdown[d.key];
        const pct = Math.round(v * 100);
        return (
          <div key={d.key} className="flex items-center gap-3">
            <span style={{ width: 92, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{d.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--canvas-bg)", overflow: "hidden", border: "1px solid var(--hairline)" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: grade.color, borderRadius: 999, transition: "width .45s ease" }} />
            </div>
            <span className="tabular" data-numeric style={{ width: 26, textAlign: "right", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}
