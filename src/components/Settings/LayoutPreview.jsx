import { useEffect, useState } from "react"
import clsx from "clsx"

const SkeletonLine = ({ width = "w-full", height = "h-3" }) => (
  <div className={`bg-gray-400 rounded ${width} ${height} animate-pulse`} />
)

const LayoutPreview = ({ type, selected, onSelect }) => {
  const isFixed = type === "fixed"
  const [dynamicColumns, setDynamicColumns] = useState(3)

  const renderColumns = () => {
    const count = isFixed ? 3 : dynamicColumns
    const width = isFixed ? "w-20" : dynamicColumns === 2 ? "w-28" : "w-20"

    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-1 transition-all duration-300">
        <SkeletonLine width={width} />
        <SkeletonLine width={width} />
      </div>
    ))
  }

  useEffect(() => {
    if (isFixed) return
    const interval = setInterval(() => {
      setDynamicColumns(prev => (prev === 3 ? 2 : 3))
    }, 1400)

    return () => clearInterval(interval)
  }, [isFixed])

  return (
    <div
      onClick={() => onSelect(type)}
      className={clsx(
        "cursor-pointer border-2 rounded-lg p-3 w-full max-w-xs transition-colors duration-200",
        selected === type ? "border-blue-500 text-black bg-slate-300" : "border-gray-100 hover:border-blue-400"
      )}
    >
      <p className="text-center font-semibold mb-2 text-sm">
        {isFixed ? "Fijo (3 columnas)" : "Dinámico (auto)"}
      </p>

      <div className="bg-white border text-[10px] border-black relative aspect-[4/3] overflow-hidden min-w-72">

        {/* Header */}
        <div className="flex justify-between px-2 pt-1">
          <div className="space-y-1">
            <SkeletonLine width="w-12" />
            <SkeletonLine width="w-20" />
            <SkeletonLine width="w-16" />
          </div>
          <div className="space-y-1 text-right">
            <SkeletonLine width="w-14" />
            <SkeletonLine width="w-16" />
            <SkeletonLine width="w-12" />
          </div>
        </div>

        {/* Title */}
        <p className="text-center font-bold text-xs border-y border-black my-1">COMPROBANTE</p>

        {/* Details */}
        <div className="flex justify-between text-[9px] px-2 pt-1 gap-2">
          {renderColumns()}
        </div>

        {/* Marca de agua */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 opacity-40 pointer-events-none">
          <img src="TMBC.png" alt="marca agua" className="w-36 mx-auto" />
        </div>

        {/* Footer */}
        <div className="absolute bottom-1 left-2 right-2 text-[8px] flex justify-between pt-1 border-t border-black">
          <SkeletonLine width="w-24" height="h-2" />
          <SkeletonLine width="w-24" height="h-2" />
        </div>
      </div>
    </div>
  )
}

export default LayoutPreview
