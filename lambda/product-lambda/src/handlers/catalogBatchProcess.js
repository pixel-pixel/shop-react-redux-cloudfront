import AWS from 'aws-sdk'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const db = new AWS.DynamoDB.DocumentClient();
const snsClient = new SNSClient({ region: 'eu-west-1' });

const productTable = process.env.TABLE_PRODUCTS;
const stocksTable = process.env.TABLE_STOCKS;
const TOPIC_ARN = 'arn:aws:sns:eu-west-1:645756223154:createProductTopic';

const putData = async (tableName, item) => {
    try {
        await db.put({
            TableName: tableName,
            Item: item,
        }).promise();
    } catch (error) {
        throw new Error(error);
    }
};

const publishMessage = async (productTitle) => {
    const command = new PublishCommand({
        Message: `The ${productTitle} has been created`,
        TopicArn: TOPIC_ARN
    }); 
    try {
        await snsClient.send(command);
    } catch (error) {
        throw new Error(error);
    }
};

export const catalogBatchProcess = async (event) => {
    try {
        for (const record of event?.Records) {
            const { Count: count, Price: price, Title: title, Description: description } = JSON.parse(record?.body);

            if(!record?.body) {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: `Product data is invalid` })
                };
            }

            const getGUID = AWS.util.uuid.v4();
            const productsTableItem = {
                id : getGUID,
                title,
                description,
                price
            };
            const stocksTableItem = {
                product_id: getGUID,
                count
            };

            await Promise.all([
                putData(productTable, productsTableItem),
                putData(stocksTable, stocksTableItem)
            ]);

            await publishMessage(title);

        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Product successfully created." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body:  JSON.stringify( { message: error.message || 'Something went wrong !!!' })
        };
    }
}