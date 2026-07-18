// API imperativa de diálogos — reemplazo de SweetAlert2. Todas devuelven Promise, así
// se usan desde cualquier lado (incluidos handlers async) igual que Swal.fire().
//
//   await dialog.confirm({ title, text, confirmLabel, cancelLabel })      -> boolean
//   await dialog.danger({ title, text, ack, confirmLabel, cancelLabel })  -> boolean
//   await dialog.notice("info"|"success"|"error", { title, text, confirmLabel })
//   await dialog.print({ title, subtitle, receipt|receiptHtml, confirmLabel }) -> boolean
//   toast("Guardado", { sub, kind })   // kind: ok | danger | info
//
// El <DialogHost/> (montado una vez en ContextProvider) registra los handlers reales.
// Antes de montarse, las llamadas resuelven a un valor seguro (no rompen SSR/tests).
let dialogHandler = null
let toastHandler = null

export const _registerDialog = (fn) => { dialogHandler = fn }
export const _registerToast = (fn) => { toastHandler = fn }

const run = (type, opts) =>
  dialogHandler ? dialogHandler(type, opts || {}) : Promise.resolve(type === "notice" ? undefined : false)

export const dialog = {
  confirm: (opts) => run("confirm", opts),
  danger: (opts) => run("danger", opts),
  notice: (kind = "info", opts = {}) => run("notice", { kind, ...opts }),
  print: (opts) => run("print", opts),
}

// Toast (abajo-centro). kind: ok | danger | info. sub opcional (mono).
export const toast = (title, { sub = "", kind = "ok" } = {}) => {
  if (toastHandler) toastHandler({ title, sub, kind })
}

export default dialog
