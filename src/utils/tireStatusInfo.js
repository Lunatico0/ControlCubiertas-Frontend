import FiberNewIcon from '@mui/icons-material/FiberNewRounded';
import LooksOneIcon from '@mui/icons-material/LooksOneRounded';
import LooksTwoIcon from '@mui/icons-material/LooksTwoRounded';
import Looks3Icon from '@mui/icons-material/Looks3Rounded';
import HourglassIcon from '@mui/icons-material/HourglassTopRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

const tireStatusInfo = {
  Nueva: {
    colorClass: "bg-blue-300 dark:bg-blue-300/60",
    description: "Cubierta nueva sin uso previo",
    icon: FiberNewIcon,
    order: 1,
  },
  "1er Recapado": {
    colorClass: "bg-green-400 dark:bg-green-400/60",
    description: "Cubierta con un recapado realizado",
    icon: LooksOneIcon,
    order: 2,
  },
  "2do Recapado": {
    colorClass: "bg-yellow-300 dark:bg-yellow-300/60",
    description: "Cubierta con dos recapados realizados",
    icon: LooksTwoIcon,
    order: 3,
  },
  "3er Recapado": {
    colorClass: "bg-orange-400 dark:bg-orange-400/60",
    description: "Cubierta con tres recapados realizados",
    icon: Looks3Icon,
    order: 4,
  },
  "A recapar": {
    colorClass: "bg-neutral-700 dark:bg-neutral-700/60",
    description: "Cubierta enviada a recapado",
    icon: HourglassIcon,
    order: 5,
  },
  Descartada: {
    colorClass: "bg-red-500 dark:bg-red-500/60",
    description: "Cubierta fuera de servicio",
    icon: CloseIcon,
    order: 6,
  },
}

export default tireStatusInfo

export const getOrderedStatuses = () =>
  Object.keys(tireStatusInfo).sort((a, b) => tireStatusInfo[a].order - tireStatusInfo[b].order)

export const canBeRecapped = (status) =>
  ["Nueva", "1er Recapado", "2do Recapado"].includes(status)

export const getNextRecapStatus = (current) => {
  const next = {
    Nueva: "1er Recapado",
    "1er Recapado": "2do Recapado",
    "2do Recapado": "3er Recapado",
  }
  return next[current] || null
}
