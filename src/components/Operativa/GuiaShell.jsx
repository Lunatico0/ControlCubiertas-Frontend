import { useTheme } from "@context/ThemeContext"
import { Link } from "react-router-dom"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"
import BrandLogo from "@components/BrandLogo"

// Shell común de las guías (manual operativo y manual del admin). Layout: TOC lateral FIJO
// (altura de viewport, no scrollea con el contenido) + main scrolleable + toggle de tema.
// Respeta claro/oscuro (vars). Cada guía aporta su TOC y su contenido (children). Los
// helpers de tipografía se exportan para armar el contenido sin duplicar estilos.
export const H2 = ({ id, children }) => (
  <h2 id={id} className="mt-12 pb-3 text-[26px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)", borderBottom: "1px solid var(--bd)", scrollMarginTop: 24 }}>{children}</h2>
)
export const H3 = ({ children }) => <h3 className="mb-2 mt-[26px] text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{children}</h3>
export const P = ({ children }) => <p className="text-[15px]" style={{ lineHeight: 1.7, color: "var(--tx-2)" }}>{children}</p>
export const B = ({ children }) => <b style={{ color: "var(--tx)" }}>{children}</b>
export const UL = ({ children }) => <ul className="pl-[22px] text-[15px]" style={{ lineHeight: 1.8, color: "var(--tx-2)" }}>{children}</ul>
export const Kbd = ({ children }) => <span style={{ fontFamily: "'IBM Plex Mono'", background: "var(--input)", border: "1px solid var(--bd-strong)", borderRadius: 5, padding: "1px 7px" }}>{children}</span>
export const Callout = ({ Icon, tone, children }) => (
  <div className="mt-3.5 flex gap-[11px] rounded-[11px] px-4 py-3.5" style={{ border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`, background: `color-mix(in srgb, ${tone} 7%, transparent)` }}>
    <span className="inline-flex flex-none" style={{ color: tone }}><Icon sx={{ fontSize: 18 }} /></span>
    <div className="text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--tx-2)" }}>{children}</div>
  </div>
)
export const Faqs = ({ items }) => (
  <div className="mt-4 flex flex-col gap-3">
    {items.map((f) => (
      <div key={f.q} className="rounded-[11px] px-[18px] py-4" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
        <div className="mb-1.5 text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{f.q}</div>
        <div className="text-[14px]" style={{ lineHeight: 1.65, color: "var(--tx-2)" }}>{f.a}</div>
      </div>
    ))}
  </div>
)

const Logo = ({ c = "var(--ink-lime)", s = 34 }) => (
  <svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="3.4" strokeDasharray="78 22" strokeLinecap="round" transform="rotate(-50 20 20)" /><circle cx="20" cy="20" r="6.4" stroke={c} strokeWidth="3.4" /></svg>
)

const GuiaShell = ({ sidebarTitle, badge, eyebrow, title, intro, toc, backTo = "/", backLabel = "Volver a la app", footer, children }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-screen w-full overflow-hidden text-left" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* TOC — fijo (altura de viewport, no scrollea con el contenido) */}
      <aside className="hidden h-screen w-[270px] flex-none flex-col overflow-y-auto px-5 py-[26px] md:flex" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--bd-faint)" }}>
        <div className="mb-3 flex flex-col gap-2">
          <BrandLogo height={26} />
          <div className="text-[13px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{sidebarTitle}</div>
        </div>
        {badge && <div className="mb-[18px] ml-[45px] inline-block self-start rounded-full px-[9px] py-[3px] text-[9.5px]" style={{ fontFamily: "'IBM Plex Mono'", letterSpacing: ".1em", color: "var(--ink-purple)", background: "color-mix(in srgb, var(--ink-purple) 14%, transparent)" }}>{badge}</div>}
        <nav className="flex flex-col gap-px">
          {toc.map((t) => (
            <a key={t.href} href={t.href} className="flex items-center gap-2.5 rounded-lg px-[11px] py-[9px] text-[13px]" style={{ textDecoration: "none", color: "var(--tx-3)" }}>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "var(--tx-7)", width: 16 }}>{t.num}</span>{t.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-[18px]" style={{ borderTop: "1px solid var(--bd-faint)" }}>
          <button onClick={toggleTheme} className="mb-2.5 flex w-full items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-[13px] font-medium" style={{ borderColor: "var(--bd)", background: "var(--elev)", color: "var(--tx-2)" }}>
            <span className="inline-flex" style={{ color: "var(--ink-lime)" }}>{isDarkMode ? <DarkModeRoundedIcon sx={{ fontSize: 17 }} /> : <LightModeRoundedIcon sx={{ fontSize: 18 }} />}</span>
            {isDarkMode ? "Tema oscuro" : "Tema claro"}
          </button>
          <Link to={backTo} className="inline-flex items-center gap-2 text-[12.5px]" style={{ color: "var(--ink-lime)", textDecoration: "none" }}>
            <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} /> {backLabel}
          </Link>
        </div>
      </aside>

      {/* CONTENIDO — el scroll vive acá (la página no scrollea, el TOC queda fijo) */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto" style={{ maxWidth: 820, padding: "52px 48px 90px" }}>
          <div className="mb-3 text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", letterSpacing: ".14em", color: "var(--ink-lime)" }}>{eyebrow}</div>
          <h1 className="text-[40px] font-bold" style={{ fontFamily: "'Space Grotesk'", letterSpacing: "-.02em", color: "var(--tx)", lineHeight: 1.05 }}>{title}</h1>
          <p className="mt-4 text-[16px]" style={{ lineHeight: 1.65, color: "var(--tx-3)", maxWidth: 640 }}>{intro}</p>
          {children}
          <div className="mt-14 flex items-center gap-2.5 pt-[22px] text-[12.5px]" style={{ borderTop: "1px solid var(--bd)", color: "var(--tx-7)", fontFamily: "'IBM Plex Mono'" }}>
            <Logo c="var(--tx-7)" s={20} /> {footer}
          </div>
        </div>
      </main>
    </div>
  )
}

export default GuiaShell
