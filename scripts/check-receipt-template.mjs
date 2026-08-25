// Chequeo del generador del comprobante. El frontend todavía no tiene runner de tests, así que
// esto se corre a mano: `node scripts/check-receipt-template.mjs` (sale con código 1 si falla).
//
// Cubre las dos mitades del contrato de renderComprobanteHTML:
//   1. Un receiptDesign hostil NO puede inyectar markup ni handlers. El design lo escribe el
//      tenant-admin, pero lo renderizan TODOS los operarios al imprimir, con
//      dangerouslySetInnerHTML: sin saneo, un admin ejecuta código en la sesión de su gente.
//   2. Los valores LEGÍTIMOS del editor siguen llegando intactos — que el saneo no se pase de
//      rosca y rompa el comprobante real.
import { renderComprobanteHTML } from '../src/utils/receipt-template.js';

const base = {
  company: { name: 'Empresa' },
  meta: { numero: '0001-00000001', fecha: '25/8/2026', tipo: 'Alta' },
  sectionData: { cubierta: { heading: 'Datos de la cubierta', rows: [{ k: 'N° interno', v: '1' }] } },
};
const render = (design) => renderComprobanteHTML({ ...base, design });

let fallos = 0;
const chequear = (etiqueta, ok) => {
  if (!ok) fallos++;
  console.log(`${ok ? '✓' : '✗ FALLA'}  ${etiqueta}`);
};

// ── 1. vectores de inyección ────────────────────────────────────────────────────────────────
const ATAQUES = [
  ['logo rompe el src e inyecta un handler', { logo: 'x" onerror="window.__PWNED=1' }, /onerror\s*=/i],
  ['accent rompe el style e inyecta un handler', { accent: 'red" onmouseover="window.__PWNED=1' }, /onmouseover\s*=/i],
  ['font cierra el atributo y abre un script', { font: 'serif"><script>window.__PWNED=1<\/script><span style="' }, /<script/i],
  ['logo con javascript: no se renderiza', { logo: 'javascript:alert(1)' }, /javascript:/i],
  ['accent con expresión CSS', { accent: 'url(javascript:alert(1))' }, /javascript:/i],
];
for (const [etiqueta, design, marcador] of ATAQUES) {
  chequear(etiqueta, !marcador.test(render(design)));
}

// ── 2. valores legítimos del editor ─────────────────────────────────────────────────────────
const FONTS = ["'Space Grotesk', sans-serif", "'IBM Plex Sans', sans-serif", "'IBM Plex Mono', monospace", 'Georgia, serif'];
const ACCENTS = ['#1F7A43', '#2358C5', '#334155', '#C2410C', '#6D28D9'];
const LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

for (const f of FONTS) chequear(`fuente conservada: ${f}`, render({ font: f }).includes(`font-family:${f}`));
for (const a of ACCENTS) chequear(`acento conservado: ${a}`, render({ accent: a }).includes(a));
chequear('logo dataURL sale como <img>', render({ logo: LOGO }).includes('<img src="data:image/png;base64,'));
chequear('sin logo cae al placeholder', render({}).includes('LOGO'));

console.log(`\n${fallos === 0 ? 'OK' : `${fallos} FALLAS`} — ${ATAQUES.length + FONTS.length + ACCENTS.length + 2} comprobaciones`);
process.exit(fallos ? 1 : 0);
