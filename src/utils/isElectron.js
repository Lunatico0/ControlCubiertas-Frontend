const isElectron = () => {
  return !!(typeof window !== 'undefined' && window.electronAPI);
};

// Props para un link a una página interna que "se abre aparte": en web, pestaña nueva
// (target=_blank); en Electron (file:// + HashRouter) eso no funciona → misma ventana
// vía hash (#/ruta). Se usa para las guías (Ayuda → guía completa).
export const externalPageProps = (path) =>
  isElectron()
    ? { href: `#${path}` }
    : { href: path, target: '_blank', rel: 'noopener noreferrer' };

export default isElectron;
