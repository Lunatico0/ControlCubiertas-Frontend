// Archivo central para exportar todas las APIs
export * from "./orders"
export * from "./tires"
export * from "./vehicles"

// Re-exportar las instancias de axios por si se necesitan
export { default as ordersAPI } from "./orders"
export { default as tiresAPI } from "./tires"
export { default as vehiclesAPI } from "./vehicles"
