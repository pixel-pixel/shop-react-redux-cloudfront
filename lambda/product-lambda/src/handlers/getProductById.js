import AWS from 'aws-sdk'
import { getStockForProduct } from '../utils/getStockForProduct.js'

const db = new AWS.DynamoDB()
const productTable = process.env.TABLE_PRODUCTS

export const getProductById = async (event) => {
  console.log({ event })
  
  try {
    const { productId } = event.pathParameters

    const product = await db.getItem({
      TableName: productTable,
      Key: {
        id: {
          S: productId
        }
      }
    }).promise()
    console.log('product', JSON.stringify(product));
    
    const res = {
      ...AWS.DynamoDB.Converter.unmarshall(product),
      count: await getStockForProduct(product.id.S)
    }

    if (!product) {
      return {
        statusCode: 404,
        body: `Product with id ${productId} didn't found`
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(res)
    }

  } catch (error) {
    const message = error.message || 'Something went wrong !!!'
    return {
      statusCode: 500,
      body: JSON.stringify({ message })
    }
  }
}