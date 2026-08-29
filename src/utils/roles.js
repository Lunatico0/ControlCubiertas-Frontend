// Etiqueta única del rol de un usuario (t121).
//
// El mismo admin aparecía como "Operativo" en el sidebar de la operativa y como "Tenant Admin"
// en el del panel, con estilos idénticos y texto distinto — y el panel de Usuarios lo llamaba
// "Administrador", que es un tercer nombre. El rol se lee como dato de IDENTIDAD: dos valores
// para el mismo usuario en la misma sesión generan duda sobre qué permisos tiene realmente.
//
// La causa de fondo era que la operativa mostraba una etiqueta fija: describía el SHELL en el
// que estabas parado, no quién sos. Un admin que entra a la operativa sigue siendo admin.
//
// El vocabulario que gana es el del panel de Usuarios, que es donde el rol se ADMINISTRA:
// "Administrador" y "Operario".
const ETIQUETAS = {
  "tenant-admin": "Administrador",
  operator: "Operario",
}

export const etiquetaDeRol = (role) => ETIQUETAS[role] || "Operario"

export default etiquetaDeRol
