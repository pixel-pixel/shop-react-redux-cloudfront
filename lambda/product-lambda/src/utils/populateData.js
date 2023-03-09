import AWS from 'aws-sdk'
import { productsMock } from '../mocks/products.js'
import { stocksMock } from '../mocks/stocks.js'

AWS.config.update({ region: 'eu-west-1' })
const db = AWS.DynamoDB.DocumentClient()

export const populateData = async (TableName, Items) => {
  for (const Item of Items) {
    await db.put({ TableName, Item }).promise()
  }
}

populateData('products', productsMock)
populateData('stocks')