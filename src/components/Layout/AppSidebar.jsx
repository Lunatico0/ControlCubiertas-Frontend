import { useState } from "react"
import { useTheme } from "@context/ThemeContext"
import { externalPageProps } from "@utils/isElectron"
import BrandLogo from "@components/BrandLogo"
import UpdaterButton from "@components/Updater/UpdaterButton"
import UpdaterModal from "@components/Updater/UpdaterModal"
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined"
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined"
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined"
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined"

// Shell compartido del sidebar (aside) — usado por la app operativa (OperativaLayout)
// y el panel del tenant-admin (AdminLayout). Unifica ancho (w-64), navegación, updater,
// toggle de tema, perfil y popover de ayuda. El look sale del design system de tokens
// (var(--x)) + data-app-theme; el markup es el que ya existía, homogeneizado entre ambos.
//
// Props:
//   nav       — [{ key, label, icon, active, onClick, dataTour? }] ítems de navegación
//   belowNav  — nodo opcional renderizado DESPUÉS del <nav> (botón "Panel administrativo"
//               en operativa; chip "Cuenta PRÓXIMAMENTE" en admin). Puede ser null.
//   upd       — objeto de useUpdater() (isDesktop, current, bip, open, phase, list, dl,
//               installingV + handlers openModal/closeModal/recheck/download/installNow/…)
//   user      — { name, roleLabel, initials, avatarBg, avatarColor } para la fila de perfil
//   help      — { dataTour, onStartTour, guideHref, guideLabel, guideSubtitle }
//   onLogout  — handler de cierre de sesión
const AppSidebar = ({ nav, belowNav, upd, user, help, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const [helpMenu, setHelpMenu] = useState(false) // popover de ayuda en el perfil

  return (
    // RAIL bajo lg (1024px). Con 256px fijos, a 768px quedaban 512px de contenido y las
    // pantallas anchas (Reportes, Editor de comprobante) se recortaban SIN scroll: había
    // elementos con right > 768 a los que el usuario no podía llegar de ninguna manera.
    // Colapsado quedan iconos con su `title` como etiqueta accesible.
    <aside className="group/rail flex w-16 flex-none flex-col lg:w-64" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--bd-faint)" }}>
      {/* Logo — sólo el isotipo cuando el rail está colapsado */}
      <div className="flex items-center justify-center px-2 pb-5 pt-[22px] lg:justify-start lg:px-5">
        <BrandLogo height={65} className="hidden lg:block" />
        <BrandLogo height={30} icon className="lg:hidden" />
      </div>

      {/* Navegación
          Los ítems son <button> y no <div>: son controles reales, así que tienen que entrar en
          el orden de tabulación y responder a Enter/Espacio. Antes eran divs clicables y el
          cursor pointer era su única señal de que se podían tocar.
          El hover cambia fondo y color: la transición ya estaba declarada, pero no había ningún
          estado que animar, así que pasar el mouse por encima no producía absolutamente nada. */}
      <nav className="flex flex-col gap-1 px-3 pt-2">
        {nav.map((item) => (
          <button
            key={item.key}
            type="button"
            data-tour={item.dataTour}
            onClick={item.onClick}
            aria-current={item.active ? "page" : undefined}
            title={item.label}
            className="flex w-full cursor-pointer items-center justify-center gap-[13px] rounded-[var(--r-md)] px-[13px] py-[11px] text-left text-[14px] transition-colors lg:justify-start"
            style={{
              fontWeight: item.active ? 600 : 500,
              color: item.active ? "var(--ink-lime)" : "var(--tx-4)",
              // El tint subió de 12% a 16% al sacar la barra lateral: el fondo más el texto lima
              // alcanzan para marcar la sección activa. La barra era un left-accent, que
              // ART-DIRECTION prohíbe explícitamente (sección 2, lista no negociable), y encima
              // era el único box-shadow de toda la pantalla del panel.
              background: item.active ? "color-mix(in srgb, var(--ink-lime) 16%, transparent)" : "transparent",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (item.active) return // el activo ya tiene su tratamiento
              e.currentTarget.style.background = "var(--hover)"
              e.currentTarget.style.color = "var(--tx-2)"
            }}
            onMouseLeave={(e) => {
              if (item.active) return
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--tx-4)"
            }}
          >
            <span className="inline-flex h-5 w-5 flex-none items-center justify-center">{item.icon}</span>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Contenido opcional debajo del nav (acceso admin / chip de cuenta) */}
      {belowNav && <div className="hidden px-3 lg:block">{belowNav}</div>}

      {/* Updater (solo desktop) + toggle de tema, pegados al fondo */}
      <div className="mt-auto flex flex-col gap-2 px-3 pt-2 pb-3">
        {upd.isDesktop && <UpdaterButton current={upd.current} bip={upd.bip} onClick={upd.openModal} />}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Tema oscuro" : "Tema claro"}
          className="flex w-full items-center justify-center gap-[11px] rounded-[var(--r-md)] border px-3 py-[10px] lg:justify-start"
          style={{ borderColor: "var(--bd)", background: "var(--elev)" }}
        >
          <span className="inline-flex h-5 w-5 flex-none items-center" style={{ color: "var(--ink-lime)" }}>
            {isDarkMode ? <DarkModeOutlinedIcon sx={{ fontSize: 18 }} /> : <LightModeOutlinedIcon sx={{ fontSize: 19 }} />}
          </span>
          <span className="hidden text-[13px] font-medium lg:inline" style={{ color: "var(--tx-2)" }}>
            {isDarkMode ? "Tema oscuro" : "Tema claro"}
          </span>
        </button>
      </div>

      {/* Perfil + ayuda + logout */}
      <div className="relative flex flex-col items-center gap-[11px] p-3 lg:flex-row" style={{ borderTop: "1px solid var(--bd-faint)" }}>
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-bold"
          style={{ background: user.avatarBg, color: user.avatarColor, fontFamily: "var(--font-display)" }}
        >
          {user.initials}
        </div>
        <div className="hidden min-w-0 flex-1 lg:block" style={{ lineHeight: 1.3 }}>
          <div className="truncate text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{user.name}</div>
          <div className="text-[11px]" style={{ color: "var(--tx-5)" }}>{user.roleLabel}</div>
        </div>
        <button
          data-tour={help.dataTour}
          title="Ayuda"
          onClick={() => setHelpMenu((v) => !v)}
          className="inline-flex cursor-pointer rounded-[var(--r-sm)] p-[7px]"
          style={{ color: helpMenu ? "var(--ink-lime)" : "var(--tx-6)", background: helpMenu ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "transparent" }}
        >
          <HelpOutlineRoundedIcon sx={{ fontSize: 17 }} />
        </button>
        <button
          title="Cerrar sesión"
          onClick={onLogout}
          className="inline-flex cursor-pointer rounded-[var(--r-sm)] p-[7px]"
          style={{ color: "var(--tx-6)" }}
        >
          <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
        </button>

        {helpMenu && (
          <>
            <div className="fixed inset-0 z-35" onClick={() => setHelpMenu(false)} />
            <div className="absolute z-40 overflow-hidden rounded-[var(--r-lg)]" style={{ bottom: 58, right: 12, left: 12, background: "var(--card)", border: "1px solid var(--bd-strong)", boxShadow: "var(--elev-1)" }}>
              <div className="px-3.5 py-[11px] text-[10px] tracking-[.08em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)", borderBottom: "1px solid var(--bd-soft)" }}>AYUDA</div>
              <button onClick={() => { setHelpMenu(false); help.onStartTour() }} className="flex w-full items-center gap-[11px] px-3.5 py-3 text-left">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: "color-mix(in srgb, var(--ink-lime) 13%, transparent)", color: "var(--ink-lime)" }}><PlayArrowOutlinedIcon sx={{ fontSize: 16 }} /></span>
                <span style={{ lineHeight: 1.25 }}>
                  <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Ver guía interactiva</span>
                  <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Tour rápido por la app</span>
                </span>
              </button>
              <a {...externalPageProps(help.guideHref)} onClick={() => setHelpMenu(false)} className="flex items-center gap-[11px] px-3.5 py-3" style={{ textDecoration: "none", borderTop: "1px solid var(--bd-soft)" }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: "color-mix(in srgb, var(--ink-blue) 16%, transparent)", color: "var(--ink-blue)" }}><MenuBookOutlinedIcon sx={{ fontSize: 16 }} /></span>
                <span style={{ lineHeight: 1.25 }}>
                  <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{help.guideLabel}</span>
                  <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>{help.guideSubtitle}</span>
                </span>
              </a>
            </div>
          </>
        )}
      </div>

      {upd.open && (
        <UpdaterModal
          current={upd.current}
          phase={upd.phase}
          list={upd.list}
          dl={upd.dl}
          installingV={upd.installingV}
          onClose={upd.closeModal}
          onRecheck={upd.recheck}
          onDownload={upd.download}
          onInstallNow={upd.installNow}
          onInstallLater={upd.installLater}
        />
      )}
    </aside>
  )
}

export default AppSidebar
