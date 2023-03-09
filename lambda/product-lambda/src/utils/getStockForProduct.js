import AWS from 'aws-sdk'

const db = new AWS.DynamoDB()
const stocksTable = process.env.TABLE_STOCKS

export const getStockForProduct = async (productId) => {
  const stock = await db.getItem({
    TableName: stocksTable,
    Key: {
      product_id: { S: productId }
    }
  }).promise()

  return stock.Item.count.N
}