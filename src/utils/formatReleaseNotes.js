export function formatReleaseNotes(raw) {
  if (!raw) return "<p>Sin notas disponibles</p>";

  // 🔹 Limpiar puntos suspensivos, saltos, espacios dobles
  const cleaned = raw
    .replace(/[.…]+$/gm, "")                  // Quita puntos suspensivos finales
    .replace(/(\r\n|\n|\r)+/g, "\n")          // Normaliza saltos de línea
    .replace(/\s+/g, " ")                     // Quita múltiples espacios
    .trim();

  const lines = cleaned.split("\n").filter(Boolean);

  // Si solo hay una línea sin prefijos, mostrar como párrafo
  if (lines.length === 1 && !/^[-*]|^(feat|fix|chore|docs?|refactor):/i.test(lines[0])) {
    return `<p style="margin:0;">${lines[0]}</p>`;
  }

  const items = lines.map((line) => {
    const formatted = line
      .replace(/^feat:/i, "<strong style='color:#1d4ed8'>✨ Función:</strong>")
      .replace(/^fix:/i, "<strong style='color:#dc2626'>🐛 Corrección:</strong>")
      .replace(/^chore:/i, "<strong style='color:#6b7280'>🧹 Mantenimiento:</strong>")
      .replace(/^refactor:/i, "<strong style='color:#10b981'>🔄 Refactor:</strong>")
      .replace(/^docs?:/i, "<strong style='color:#6366f1'>📘 Docs:</strong>")
      .replace(/^[-*]\s*/, ""); // quita "- " o "* "
    return `<li style="margin-bottom: 4px;">${formatted}</li>`;
  });

  return `<ul style="padding-left: 18px; margin: 0;">${items.join("")}</ul>`;
}
