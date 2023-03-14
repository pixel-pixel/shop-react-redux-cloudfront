import { productsMock } from '../mocks/products.js'

export const getProductList = async (event) => {
  //Emulate async operation
  const products = await Promise.resolve(productsMock)

  return {
    statusCode: 200,
    body: JSON.stringify(products)
  }
}
