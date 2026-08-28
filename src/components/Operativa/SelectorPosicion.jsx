import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded"
import { tint } from "./status"

// Selector de posición con forma de camión, para el momento de asignar una cubierta.
//
// Antes era una grilla plana de botones "E1-I, E1-D, E2-IE, E2-II, E2-DI, E2-DE", sin leyenda
// ni diagrama: el operario tenía que descifrar que E es eje, I/D izquierda y derecha, y I/E
// interna y externa. Es el paso con más chances de error de toda la operación, y equivocarse
// acá desalinea el inventario físico del digital.
//
// TruckDiagram no se pudo reusar tal cual: es de solo lectura, dibuja a partir de los TIPOS de
// eje y no sabe de posiciones ocupadas ni de clicks. Acá el dibujo se arma desde las
// posiciones REALES que devuelve el backend, que son las que además traen qué cubierta ocupa
// cada lugar. Eso último ya funcionaba bien y se mantiene.
//
// Los códigos que llegan tienen la forma "E<n>-<lado>": E1-I, E2-DE, etc.
const parseCodigo = (code) => {
  const m = /^E(\d+)-(.+)$/.exec(code || "")
  return m ? { eje: Number(m[1]), lado: m[2] } : { eje: 0, lado: code || "" }
}

// Orden físico de izquierda a derecha, mirando el camión desde arriba y de frente:
// externa izquierda, interna izquierda, [eje], interna derecha, externa derecha.
const ORDEN_LADO = { IE: 0, I: 1, II: 2, DI: 3, D: 4, DE: 5 }
const esIzquierda = (lado) => lado.startsWith("I")

const Rueda = ({ pos, seleccionada, onSelect }) => {
  const ocupada = !!pos.tire
  const { lado } = parseCodigo(pos.code)

  const borde = seleccionada ? "var(--ink-lime)" : ocupada ? "var(--bd)" : "var(--bd-hover)"
  const fondo = seleccionada ? tint("var(--ink-lime)", 22) : ocupada ? "var(--bd-2)" : "var(--elev)"

  return (
    <div className="flex flex-col items-center gap-[3px]">
      <button
        type="button"
        disabled={ocupada}
        onClick={() => onSelect(pos.code)}
        title={ocupada ? `Ocupada por #${pos.tire.code}` : `Libre · ${pos.label || pos.code}`}
        aria-label={`Posición ${pos.code}${ocupada ? `, ocupada por la cubierta ${pos.tire.code}` : ", libre"}`}
        aria-pressed={seleccionada}
        style={{
          width: 26, height: 44, borderRadius: 6,
          border: `2px solid ${borde}`, background: fondo,
          cursor: ocupada ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
          color: seleccionada ? "var(--ink-lime)" : ocupada ? "var(--tx-7)" : "var(--tx-4)",
          padding: 0,
        }}
      >
        {lado}
      </button>
      {/* La cubierta que ocupa el lugar: era lo mejor de la versión vieja y se mantiene. */}
      {ocupada && (
        <span className="text-[8.5px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-7)" }}>#{pos.tire.code}</span>
      )}
    </div>
  )
}

const SelectorPosicion = ({ positions = [], value, onChange }) => {
  if (!positions.length) return null

  const ejes = [...new Set(positions.map((p) => parseCodigo(p.code).eje))].sort((a, b) => a - b)
  const elegida = positions.find((p) => p.code === value)
  const libres = positions.filter((p) => !p.tire).length

  return (
    <div className="rounded-[11px] px-3 py-3.5" style={{ border: "1px solid var(--bd)", background: "var(--input)" }}>
      <div className="mb-2 flex flex-col items-center gap-0.5">
        <span className="text-[9.5px] tracking-[.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>FRENTE</span>
        <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} style={{ color: "var(--tx-7)" }} />
      </div>

      <div className="flex flex-col items-center gap-3.5">
        {ejes.map((n) => {
          const delEje = positions.filter((p) => parseCodigo(p.code).eje === n)
          const orden = (p) => ORDEN_LADO[parseCodigo(p.code).lado] ?? 9
          const izq = delEje.filter((p) => esIzquierda(parseCodigo(p.code).lado)).sort((a, b) => orden(a) - orden(b))
          const der = delEje.filter((p) => !esIzquierda(parseCodigo(p.code).lado)).sort((a, b) => orden(a) - orden(b))
          return (
            <div key={n} className="flex items-start justify-center gap-1">
              <div className="flex gap-1">{izq.map((p) => <Rueda key={p.code} pos={p} seleccionada={p.code === value} onSelect={onChange} />)}</div>
              {/* El eje: la barra que une las dos mitades, con su número */}
              <div className="mt-[19px] flex items-center">
                <div style={{ height: 5, width: 30, background: "var(--bd-strong)", borderRadius: 3 }} />
                <span className="px-1 text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-7)" }}>E{n}</span>
                <div style={{ height: 5, width: 30, background: "var(--bd-strong)", borderRadius: 3 }} />
              </div>
              <div className="flex gap-1">{der.map((p) => <Rueda key={p.code} pos={p} seleccionada={p.code === value} onSelect={onChange} />)}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-3.5 border-t pt-2.5 text-center text-[11.5px]" style={{ borderColor: "var(--bd-soft)", color: "var(--tx-5)" }}>
        {elegida ? (
          <>Elegiste <b style={{ fontFamily: "var(--font-mono)", color: "var(--ink-lime)" }}>{elegida.code}</b> · {elegida.label || "posición libre"}</>
        ) : (
          <>Tocá una rueda libre para elegir la posición · {libres} {libres === 1 ? "libre" : "libres"}</>
        )}
      </div>
    </div>
  )
}

export default SelectorPosicion
