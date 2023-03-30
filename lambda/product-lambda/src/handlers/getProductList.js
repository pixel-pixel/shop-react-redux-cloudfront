import AWS from 'aws-sdk'
import { getStockForProduct } from '../utils/getStockForProduct.js'

const db = new AWS.DynamoDB()
const productTable = process.env.TABLE_PRODUCTS

export const getProductList = async (event) => {
  console.log({ event })

  try {
    const products = await db.scan({
      TableName: productTable
    }).promise()

    const items = products.Items

    const joinedItems = await Promise.all(
      items.map(async (i) => {
        return {
          ...AWS.DynamoDB.Converter.unmarshall(i),
          count: await getStockForProduct(i.id.S)
        }
      })
    )

    return {
      statusCode: 200,
      body: JSON.stringify(joinedItems)
    }

  } catch (error) {
    const message = error.message || 'Something went wrong !!!'
    return {
      statusCode: 500,
      body: JSON.stringify({ message })
    }
  }
}
