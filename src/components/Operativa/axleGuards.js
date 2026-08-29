import { generatePositions } from "./axles"

// Guards del editor de ejes (t139).
//
// La pantalla ya bloqueaba los ejes ocupados a mano (quitar / cambiar de tipo), pero los
// PRESETS de tipo de vehículo pasaban por encima: un clic en "Moto · 2 cubiertas" sobre un
// vehículo con 4 cubiertas montadas rehacía el esquema entero, y el 409 del backend llegaba
// recién al guardar. El dato nunca corrió riesgo; lo que se perdía era el trabajo del operario.
//
// El criterio es EL MISMO del backend (vehicle.controller → updateAxles): lo que bloquea no es
// "menos ejes" ni "menos cubiertas", es una POSICIÓN OCUPADA que desaparece del layout nuevo.

// Acepta el layout como [{type}] (forma del vehículo) o como ["simple","dual"] (forma del
// editor), porque las dos conviven: el hook trabaja con strings y el modelo guarda objetos.
const aEjes = (layout) =>
  (Array.isArray(layout) ? layout : []).map((a) => (typeof a === "string" ? { type: a } : { type: a?.type || "simple" }))

// Posiciones hoy ocupadas que el layout nuevo NO tendría. Lista vacía = el preset es aplicable.
export const posicionesOcupadasSePierden = (ocupadas, layoutNuevo) => {
  const disponibles = new Set(generatePositions(aEjes(layoutNuevo)).map((p) => p.code))
  return (Array.isArray(ocupadas) ? ocupadas : []).filter((code) => code && !disponibles.has(code))
}

// Por qué no se puede aplicar este preset, en castellano y nombrando las posiciones concretas.
// Devuelve null si SÍ se puede aplicar.
//
// `hayMontadaSinPosicion` es el caso legacy: una cubierta montada sin `position` no se puede
// verificar contra ningún layout, así que bloquea todo (mismo criterio que el backend).
export const motivoPresetIncompatible = (ocupadas, layoutNuevo, { hayMontadaSinPosicion = false } = {}) => {
  if (hayMontadaSinPosicion) {
    return "Hay una cubierta montada sin posición asignada: desasignala antes de cambiar el esquema."
  }
  const perdidas = posicionesOcupadasSePierden(ocupadas, layoutNuevo)
  if (!perdidas.length) return null
  const lista = perdidas.join(", ")
  return `Este esquema elimina ${perdidas.length === 1 ? "la posición" : "las posiciones"} ${lista}, que ${perdidas.length === 1 ? "está ocupada" : "están ocupadas"}. Desasigná esas cubiertas primero.`
}
