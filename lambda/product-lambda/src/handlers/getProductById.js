import { productsMock } from '../mocks/products.js'

export const getProductById = async (event) => {
  const { productId } = event.pathParameters

  //Emulate async operation
  const product = await Promise.resolve(productsMock.find(p => p.id === productId))

  if (!product) {
    return {
      statusCode: 404,
      body: `Product with id ${productId} didn't found`
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(product)
  }
}