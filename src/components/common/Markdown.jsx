import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Wrapper reutilizable de Markdown. Renderiza un string MD (GFM: tablas, listas de tareas,
// etc.) con la tipografía COMPACTA del design system (vars --tx-*, --bd-*, --ink-*), pensado
// para notas cortas / release-notes, no para un blog. Uso: <Markdown>{texto}</Markdown>.
// `className` opcional se mergea en el contenedor (p. ej. max-w/text-sm para un tooltip).

// Mapa de elementos → clases Tailwind. El color/tamaño base se hereda del contenedor;
// acá solo ajustamos lo que cambia por elemento.
const components = {
  p: ({ children }) => <p className="text-(--tx-2)">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-(--tx)">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="text-(--tx-4) line-through">{children}</del>,

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-(--ink-lime) underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),

  ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-5 text-(--tx-2) marker:text-(--tx-5)">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-5 text-(--tx-2) marker:text-(--tx-5)">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  // Encabezados chicos (notas, no blog): todos compactos, jerarquía por peso/tamaño leve.
  h1: ({ children }) => <h1 className="text-base font-bold text-(--tx)">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[15px] font-bold text-(--tx)">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-(--tx)">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-(--tx-2)">{children}</h4>,
  h5: ({ children }) => <h5 className="text-xs font-semibold uppercase tracking-wide text-(--tx-3)">{children}</h5>,
  h6: ({ children }) => <h6 className="text-xs font-semibold uppercase tracking-wide text-(--tx-4)">{children}</h6>,

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-(--bd-strong) pl-3 text-(--tx-3) italic">{children}</blockquote>
  ),
  hr: () => <hr className="border-(--bd)" />,

  // Bloque de código: el <pre> pone fondo/borde/scroll; el <code> de adentro va "pelado".
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-(--bd-soft) bg-(--input) p-3 text-xs leading-relaxed text-(--tx-2)">
      {children}
    </pre>
  ),
  // eslint-disable-next-line no-unused-vars -- descartamos `node` (prop de react-markdown) para no filtrarlo al DOM
  code: ({ className, children, node, ...props }) => {
    const isBlock = /language-/.test(className || "") || String(children).includes("\n")
    return isBlock ? (
      <code className="font-mono" {...props}>{children}</code>
    ) : (
      <code className="rounded bg-(--input) px-1 py-0.5 font-mono text-[0.85em] text-(--tx)" {...props}>
        {children}
      </code>
    )
  },

  // Tablas (GFM): scroll horizontal propio para no desbordar contenedores angostos (tooltip).
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-(--elev)">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-(--bd) px-2 py-1 text-left font-semibold text-(--tx-2)">{children}</th>
  ),
  td: ({ children }) => <td className="border border-(--bd) px-2 py-1 text-(--tx-3)">{children}</td>,

  img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full rounded-md" />,
}

const Markdown = ({ children, className = "" }) => (
  <div className={`space-y-2 text-sm leading-relaxed text-(--tx-2) [word-break:break-word] ${className}`.trim()}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {typeof children === "string" ? children : ""}
    </ReactMarkdown>
  </div>
)

export default Markdown
