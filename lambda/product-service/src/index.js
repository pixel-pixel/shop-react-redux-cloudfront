import { getProductsHandler } from "./handlers/getProducts.handler"

export const mainHandler = (event) => {
  if (!/.+products$/.test(event.path)) return

  return getProductsHandler()
}