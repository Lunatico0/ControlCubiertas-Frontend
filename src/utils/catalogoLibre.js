// Normalización de los campos de texto libre del alta de cubierta (t137).
//
// Marca, rodado y dibujo eran texto libre sin ninguna normalización: alcanzó con cargar una
// cubierta con la marca en minúscula para que el filtro por marca listara "michelin" y
// "Michelin" como DOS marcas. Con varios operarios cargando, el catálogo se convierte en
// MICHELIN / Michelín / "Michelin " y deja de servir para filtrar. En rodado es peor: es un
// dato de COMPATIBILIDAD, y dos formas del mismo rodado esconden cubiertas que sí existen.
//
// La normalización es deliberadamente conservadora: colapsa espacios y capitaliza palabras.
// NO toca los dígitos ni los separadores, así "295/80r22.5" queda "295/80R22.5" y no se
// inventa un formato de rodado que el operario no escribió.

// ¿Esta palabra es un CÓDIGO y no una palabra del idioma? Los dibujos de cubierta son
// códigos cortos en mayúsculas (XZA, XDE, R268) y los rodados traen dígitos: bajarles el
// case sería romperlos, no normalizarlos. El corte en 4 caracteres es el que separa un
// código de banda de rodamiento de una marca escrita a los gritos ("MICHELIN").
const esCodigo = (palabra) => /\d/.test(palabra) || (palabra.length <= 4 && palabra === palabra.toLocaleUpperCase('es-AR'))

// Colapsa los espacios y capitaliza cada palabra que sea una palabra. Los códigos se
// mandan a mayúsculas enteros y no se les toca nada más.
export const normalizarTexto = (valor) => {
  const limpio = String(valor ?? '').trim().replace(/\s+/g, ' ')
  if (!limpio) return ''
  return limpio
    .split(' ')
    .map((palabra) => (esCodigo(palabra)
      ? palabra.toLocaleUpperCase('es-AR')
      : palabra.charAt(0).toLocaleUpperCase('es-AR') + palabra.slice(1).toLocaleLowerCase('es-AR')))
    .join(' ')
}

// Valores ya cargados en el tenant para un campo, listos para un <datalist>. Colapsa las
// variantes (michelin/MICHELIN → Michelin) y ordena en castellano, que es lo que hace que la
// lista sea recorrible con la Ñ y los acentos en su lugar.
export const sugerenciasDe = (tires, campo) => {
  const vistos = new Map()
  for (const t of Array.isArray(tires) ? tires : []) {
    const v = normalizarTexto(t?.[campo])
    if (v && !vistos.has(v)) vistos.set(v, v)
  }
  return [...vistos.values()].sort((a, b) => a.localeCompare(b, 'es'))
}
