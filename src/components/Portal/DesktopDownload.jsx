import { useState, useEffect } from "react"
import isElectron from "@utils/isElectron"
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded"
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"

// El instalador se publica a GitHub Releases (electron-builder publish). Repo público →
// la API responde con CORS y el .exe se descarga sin token.
const REPO = "Lunatico0/controlCubiertas"
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`

const tintBg = (c, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`
const fmtSize = (bytes) => (bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : null)
const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return null
  }
}

// Descarga de la app de escritorio (Windows). SOLO en web: en el build Electron no tiene
// sentido (ya estás en la app). Toma el último release público vía API para que el link
// nunca quede viejo aunque el nombre del asset lleve la versión. Si la API falla, cae a un
// link a la página de releases de GitHub.
const DesktopDownload = () => {
  const [state, setState] = useState({ loading: true, asset: null, tag: null })

  useEffect(() => {
    if (isElectron()) return
    let cancelled = false
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("release"))))
      .then((rel) => {
        if (cancelled) return
        const exe = (rel.assets || []).find((a) => a.name?.toLowerCase().endsWith(".exe"))
        setState({ loading: false, asset: exe || null, tag: rel.tag_name || null })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, asset: null, tag: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (isElectron()) return null

  const { loading, asset, tag } = state
  const meta = loading
    ? "Buscando la última versión…"
    : asset
      ? [tag && `Versión ${tag}`, fmtSize(asset.size), fmtDate(asset.updated_at || asset.created_at)].filter(Boolean).join(" · ")
      : "Descargá la última versión desde GitHub"

  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-lg font-semibold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>App de escritorio</h2>
      <div className="flex flex-col items-start gap-4 rounded-xl p-5 sm:flex-row sm:items-center" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: tintBg("var(--ink-lime)", 12), color: "var(--ink-lime)" }}>
          <DesktopWindowsRoundedIcon />
        </span>
        <div className="flex-1">
          <p className="font-medium" style={{ color: "var(--tx)" }}>TireOps para Windows</p>
          <p className="mt-0.5 text-sm" style={{ color: "var(--tx-5)" }}>{meta}</p>
        </div>
        {asset ? (
          <a href={asset.browser_download_url} download
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: "#C4ED2B", color: "#0f1216" }}>
            <DownloadRoundedIcon sx={{ fontSize: 18 }} /> Descargar
          </a>
        ) : (
          <a href={RELEASES_PAGE} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
            style={{ background: "var(--elev)", border: "1px solid var(--bd)", color: "var(--tx-3)" }}>
            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} /> Ver releases
          </a>
        )}
      </div>
    </section>
  )
}

export default DesktopDownload
