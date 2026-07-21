import { useState, useEffect, useRef, useCallback } from "react"
import { showToast } from "@utils/toast"

// Hook del auto-updater (solo desktop). Maneja estado + IPC con la capa Electron.
// La API vive en window.electronAPI (inyectada por preload). En dev/web no existe;
// para poder ver el modal en el browser se puede inyectar window.__updaterMock y se
// usa como si fuese electronAPI (mismo shape). NADA de SweetAlert.
//
// Decisión: electron-updater SIEMPRE instala la ÚLTIMA versión (no una intermedia).
// Por eso listReleases() es informativo (changelog) y la descarga/instalación es una
// sola (la de la última versión). El modal muestra el botón solo en esa fila.
const getApi = () => (typeof window !== "undefined" ? window.electronAPI || window.__updaterMock : null)

export const useUpdater = () => {
  const api = getApi()
  const isDesktop = !!api

  const [current, setCurrent] = useState("") // versión instalada (getVersion)
  const [bip, setBip] = useState(false) // hay update disponible → punto rojo en el botón
  const [open, setOpen] = useState(false) // modal abierto
  const [phase, setPhase] = useState("checking") // 'checking' | 'uptodate' | 'list' | 'installing'
  const [list, setList] = useState([]) // releases más nuevos que el instalado (asc)
  const [dl, setDl] = useState({ st: "idle", pct: 0 }) // 'idle'|'downloading'|'downloaded'|'scheduled'
  const [installingV, setInstallingV] = useState("") // versión que se está instalando

  // Espejo del estado de descarga para leerlo dentro de los listeners sin re-suscribir.
  const dlStRef = useRef(dl.st)
  dlStRef.current = dl.st

  // Versión que electron-updater detectó como disponible (evento update:available). Fallback si
  // la API de GitHub (listReleases) falla o viene vacía: igual ofrecemos la descarga.
  const availableVerRef = useRef("")

  // Mount: versión instalada + listeners + chequeo en background (para prender el bip).
  useEffect(() => {
    if (!isDesktop) return

    api.getVersion?.().then(setCurrent).catch(() => {})

    const onAvailable = (_e, info) => { setBip(true); if (info?.version) availableVerRef.current = info.version }
    const onNotAvailable = () => { setBip(false); availableVerRef.current = "" }
    const onProgress = (_e, payload) => setDl({ st: "downloading", pct: payload?.percent ?? 0 })
    const onDownloaded = () => setDl({ st: "downloaded", pct: 100 })
    const onError = (_e, payload) => {
      const msg = typeof payload === "string" ? payload : payload?.message || "Error desconocido"
      showToast("error", `Error de actualización: ${msg}`)
      if (dlStRef.current === "downloading") setDl({ st: "idle", pct: 0 })
    }

    api.onUpdateAvailable?.(onAvailable)
    api.onUpdateNotAvailable?.(onNotAvailable)
    api.onUpdateProgress?.(onProgress)
    api.onUpdateDownloaded?.(onDownloaded)
    api.onUpdateError?.(onError)

    api.checkForUpdates?.() // background: prende el bip si hay update

    return () => {
      api.removeListener?.("update:available", onAvailable)
      api.removeListener?.("update:not-available", onNotAvailable)
      api.removeListener?.("update:progress", onProgress)
      api.removeListener?.("update:downloaded", onDownloaded)
      api.removeListener?.("update:error", onError)
    }
    // api es estable (misma ref de window.*); solo depende de si hay desktop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop])

  // checking → listReleases → list (si hay) / uptodate (si no o falla).
  const loadList = useCallback(() => {
    setPhase("checking")
    // Fila de fallback (sin changelog) si electron-updater detectó un update pero listReleases
    // falla/viene vacía → nunca quedamos trabados sin poder descargar.
    const fallback = () =>
      availableVerRef.current
        ? [{ version: availableVerRef.current, name: `v${availableVerRef.current}`, notes: "", date: "", size: 0 }]
        : []
    Promise.resolve(api?.listReleases?.())
      .then((rel) => {
        const arr = Array.isArray(rel) && rel.length ? rel : fallback()
        setList(arr)
        setPhase(arr.length ? "list" : "uptodate")
      })
      .catch(() => {
        const arr = fallback()
        setList(arr)
        setPhase(arr.length ? "list" : "uptodate")
      })
  }, [api])

  const openModal = useCallback(() => {
    setOpen(true)
    loadList()
  }, [loadList])

  const closeModal = useCallback(() => setOpen(false), [])

  const recheck = useCallback(() => {
    api?.checkForUpdates?.() // re-dispara el chequeo (refresca el bip)
    loadList()
  }, [api, loadList])

  const download = useCallback(() => {
    setDl({ st: "downloading", pct: 0 })
    api?.downloadUpdate?.()
  }, [api])

  const installNow = useCallback((v) => {
    setInstallingV(v)
    setPhase("installing")
    api?.installUpdate?.()
  }, [api])

  const installLater = useCallback(
    () => {
      api?.installOnNextLaunch?.()
      setDl((d) => ({ ...d, st: "scheduled" }))
      showToast("info", "Se instalará al reiniciar la app")
      closeModal()
    },
    [api, closeModal]
  )

  return {
    isDesktop,
    current,
    bip,
    open,
    phase,
    list,
    dl,
    installingV,
    openModal,
    closeModal,
    recheck,
    download,
    installNow,
    installLater,
  }
}
