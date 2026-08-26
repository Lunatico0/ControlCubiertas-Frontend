// Props para un contenedor clicable que NO puede ser un <button>.
//
// La regla general es cambiar el tag a <button> y listo: así se resolvieron el nav, el acceso al
// panel administrativo, la X del diálogo de impresión y los controles del login. Pero las cards de
// cubierta y las filas de vehículo tienen botones de acción ADENTRO, y un button dentro de otro
// button es HTML inválido: el navegador desarma el árbol y los de adentro dejan de funcionar.
//
// Para esos va el patrón ARIA equivalente: role="button", tabIndex 0 y Enter/Espacio, que es lo
// que un <button> hace de fábrica. Sin esto, un operario con guantes tenía que ir al mouse para
// abrir cada cubierta.
//
// El contenedor necesita además un nombre accesible (aria-label), porque su contenido es una
// pila de datos sueltos y no un texto que lo describa. Eso lo pone cada caller.
export const clickable = (onActivate) => ({
  role: "button",
  tabIndex: 0,
  onClick: onActivate,
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return
    // Una tecla sobre un control de adentro burbujea hasta acá: ese control ya se activó solo y
    // la fila no tiene que abrirse además.
    if (e.target !== e.currentTarget) return
    e.preventDefault() // Espacio, si no, scrollea la página
    onActivate(e)
  },
})
