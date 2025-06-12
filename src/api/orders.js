import { createAPI } from "./client"
const ordersAPI = createAPI("orders")

export const checkOrderNumber = async (orderNumber) => (await ordersAPI.get(`/check/${orderNumber}`)).data

export default ordersAPI
