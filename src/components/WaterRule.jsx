// A hairline "gauge" rule: a baseline with evenly spaced tick marks, styled
// after the level markers painted on river-gauge posts along Nepal's
// flood-watch stations. Used as the one recurring structural signature
// across every page instead of a decorative divider.
export default function WaterRule({ color = 'var(--line)' }) {
  return (
    <svg className="water-rule" viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="7" x2="400" y2="7" stroke={color} strokeWidth="1.5" />
      {Array.from({ length: 21 }).map((_, i) => {
        const x = i * 20
        const tall = i % 5 === 0
        return (
          <line
            key={i}
            x1={x}
            y1={tall ? 2 : 4.5}
            x2={x}
            y2={tall ? 12 : 9.5}
            stroke={color}
            strokeWidth={tall ? 1.5 : 1}
          />
        )
      })}
    </svg>
  )
}
