import { colors, text, button } from "@utils/tokens";

const EmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ring-1 ring-black/10 dark:ring-white/10">
          <img src="Cubierta.png" alt="Sin cubiertas" className="w-16 h-16 opacity-50 filter grayscale" />
        </div>

        <h3 className={`${text.heading} text-xl mb-2`}>No hay cubiertas registradas</h3>

        <p className={`${colors.muted} mb-6`}>
          Comienza agregando tu primera cubierta al inventario para empezar a gestionar tu flota.
        </p>

        <div className="space-y-3">
          <button className={`${button.primary} w-full`}>
            Agregar primera cubierta
          </button>

          <p className={`text-sm ${colors.muted}`}>
            También puedes importar cubiertas desde un archivo CSV
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
