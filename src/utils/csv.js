// Descarga un CSV (con BOM UTF-8 para que Excel respete acentos) armado desde headers + filas.
// Escapa cada celda (comillas dobles). Unifica el patrón blob+BOM+anchor repetido en el panel.
export function downloadCSV(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
