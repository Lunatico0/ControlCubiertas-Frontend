// Íconos del sistema de diálogos (line-icons, currentColor). kind → paths.
const PATHS = {
  ask: { sw: 1.9, d: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"] },
  trash: { sw: 1.9, d: ["M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"] },
  info: { sw: 1.9, d: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 16v-4M12 8h.01"] },
  check: { sw: 2.1, d: ["M20 6 9 17l-5-5"] },
  err: { sw: 1.9, d: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m15 9-6 6M9 9l6 6"] },
  printer: { sw: 1.8, d: ["M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 9V3h12v6", "M6 14h12v8H6z"] },
  x: { sw: 1.9, d: ["M18 6 6 18M6 6l12 12"] },
  warn: { sw: 1.9, d: ["m12 3.5 9 15.5H3L12 3.5Z", "M12 10v3.6M12 17h.01"] },
}

const DlgIcon = ({ kind = "info", size = 22 }) => {
  const p = PATHS[kind] || PATHS.info
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round">
      {p.d.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

export default DlgIcon
