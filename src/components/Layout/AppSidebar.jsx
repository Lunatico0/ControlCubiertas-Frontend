import { useState } from "react"
import { useTheme } from "@context/ThemeContext"
import { externalPageProps } from "@utils/isElectron"
import BrandLogo from "@components/BrandLogo"
import UpdaterButton from "@components/Updater/UpdaterButton"
import UpdaterModal from "@components/Updater/UpdaterModal"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded"

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
    <aside className="flex w-64 flex-none flex-col" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--bd-faint)" }}>
      {/* Logo */}
      <div className="flex items-center px-5 pb-5 pt-[22px]">
        <BrandLogo height={65} />
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 px-3 pt-2">
        {nav.map((item) => (
          <div
            key={item.key}
            data-tour={item.dataTour}
            onClick={item.onClick}
            className="flex cursor-pointer items-center gap-[13px] rounded-[9px] px-[13px] py-[11px] text-[14px] transition-colors"
            style={{
              fontWeight: item.active ? 600 : 500,
              color: item.active ? "var(--ink-lime)" : "var(--tx-4)",
              background: item.active ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "transparent",
              boxShadow: item.active ? "inset 3px 0 0 var(--ink-lime)" : "none",
            }}
          >
            <span className="inline-flex h-5 w-5 flex-none items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Contenido opcional debajo del nav (acceso admin / chip de cuenta) */}
      {belowNav && <div className="px-3">{belowNav}</div>}

      {/* Updater (solo desktop) + toggle de tema, pegados al fondo */}
      <div className="mt-auto flex flex-col gap-2 px-3 pt-2 pb-3">
        {upd.isDesktop && <UpdaterButton current={upd.current} bip={upd.bip} onClick={upd.openModal} />}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-[11px] rounded-[9px] border px-3 py-[10px]"
          style={{ borderColor: "var(--bd)", background: "var(--elev)" }}
        >
          <span className="inline-flex h-5 w-5 flex-none items-center" style={{ color: "var(--ink-lime)" }}>
            {isDarkMode ? <DarkModeRoundedIcon sx={{ fontSize: 18 }} /> : <LightModeRoundedIcon sx={{ fontSize: 19 }} />}
          </span>
          <span className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>
            {isDarkMode ? "Tema oscuro" : "Tema claro"}
          </span>
        </button>
      </div>

      {/* Perfil + ayuda + logout */}
      <div className="relative flex items-center gap-[11px] p-3" style={{ borderTop: "1px solid var(--bd-faint)" }}>
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-bold"
          style={{ background: user.avatarBg, color: user.avatarColor, fontFamily: "'Space Grotesk'" }}
        >
          {user.initials}
        </div>
        <div className="min-w-0 flex-1" style={{ lineHeight: 1.3 }}>
          <div className="truncate text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{user.name}</div>
          <div className="text-[11px]" style={{ color: "var(--tx-5)" }}>{user.roleLabel}</div>
        </div>
        <button
          data-tour={help.dataTour}
          title="Ayuda"
          onClick={() => setHelpMenu((v) => !v)}
          className="inline-flex cursor-pointer rounded-[7px] p-[7px]"
          style={{ color: helpMenu ? "var(--ink-lime)" : "var(--tx-6)", background: helpMenu ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "transparent" }}
        >
          <HelpOutlineRoundedIcon sx={{ fontSize: 17 }} />
        </button>
        <button
          title="Cerrar sesión"
          onClick={onLogout}
          className="inline-flex cursor-pointer rounded-[7px] p-[7px]"
          style={{ color: "var(--tx-6)" }}
        >
          <LogoutRoundedIcon sx={{ fontSize: 17 }} />
        </button>

        {helpMenu && (
          <>
            <div className="fixed inset-0 z-35" onClick={() => setHelpMenu(false)} />
            <div className="absolute z-40 overflow-hidden rounded-xl" style={{ bottom: 58, right: 12, left: 12, background: "var(--card)", border: "1px solid var(--bd-strong)", boxShadow: "0 18px 44px rgba(0,0,0,.5)" }}>
              <div className="px-3.5 py-[11px] text-[10px] tracking-[.08em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)", borderBottom: "1px solid var(--bd-soft)" }}>AYUDA</div>
              <button onClick={() => { setHelpMenu(false); help.onStartTour() }} className="flex w-full items-center gap-[11px] px-3.5 py-3 text-left">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ink-lime) 13%, transparent)", color: "var(--ink-lime)" }}><PlayArrowRoundedIcon sx={{ fontSize: 16 }} /></span>
                <span style={{ lineHeight: 1.25 }}>
                  <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Ver guía interactiva</span>
                  <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Tour rápido por la app</span>
                </span>
              </button>
              <a {...externalPageProps(help.guideHref)} onClick={() => setHelpMenu(false)} className="flex items-center gap-[11px] px-3.5 py-3" style={{ textDecoration: "none", borderTop: "1px solid var(--bd-soft)" }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ink-blue) 16%, transparent)", color: "var(--ink-blue)" }}><MenuBookRoundedIcon sx={{ fontSize: 16 }} /></span>
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
