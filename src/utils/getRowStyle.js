export const getRowStyle = (type, flag) => {
  switch (type) {
    case 'asignacion':
      return 'bg-green-50 dark:bg-green-900/10';
    case 'desasignacion':
      return 'bg-red-50 dark:bg-red-900/10';
    case 'estado':
      return 'bg-blue-50 dark:bg-blue-900/10';
    case 'correccion':
      return flag ? 'bg-yellow-100 dark:bg-yellow-900/10 font-semibold' : '';
    default:
      return '';
  }
};

export const dictionary = {
  'pattern': 'Dibujo',
  'brand': 'Marca',
  'serialNumber': 'N° Serie',
  'code': 'Código Interno',
  'asignacion': 'Asignación',
  'desasignacion': 'Desasignación',
  'estado': 'Estado',
  'correccion': 'Corrección',
}
