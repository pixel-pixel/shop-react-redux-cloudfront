import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import csv from 'csv-parser'

const s3 = new S3Client({ region: 'eu-west-1' });
const sqsClient = new SQSClient({ region: 'eu-west-1' });
const BUCKET = 'uploaded-bucket-gwjf';
const SQS_QUEUE_URL = 'https://sqs.eu-west-1.amazonaws.com/645756223154/catalogBatchProcessQueue';

const copyObject = async (params) => {
  const { Bucket, Key } = params;
  const command = new CopyObjectCommand({
      Bucket,
      CopySource: `${Bucket}/${Key}`,
      Key: Key.replace('uploaded', 'parsed')
  });
  try {
      const response = await s3.send(command);
      console.log('Successfully copied!', response);
  } catch (err) {
      console.error(err);
  }
};

const deleteObject = async (params) => {
  const command = new DeleteObjectCommand(params);
  try {
      const response = await s3.send(command);
      console.log('Successfully deleted!', response);
  } catch (err) {
      console.error(err);
  }
};

const sendQueue = async (chunk) => {
  const command = new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify(chunk)
  });
  try {
      await sqsClient.send(command);
  } catch (error) {
      console.error(err);
  }
};

export const importFileParser = async () => {
  try {
    for (const record of event?.Records) {
      const params = {
          Bucket: BUCKET,
          Key: record?.s3?.object?.key,
      };
      const command = new GetObjectCommand(params);
      const s3Stream = await s3.send(command);

      const stream = new Promise((resolve, reject) => {
          const chunks = [];

          s3Stream.Body
              .pipe(csv())
              .on("data", async (chunk) => {
                  console.log(chunk);
                  await sendQueue(chunk);
                  chunks.push(chunk);
              })
              .on("error", reject)
              .on("end", () => {
                  resolve(chunks);
              });
      });

      await stream;
      await copyObject(params);
      await deleteObject(params);
    }

    return {
        statusCode: 202,
        body: JSON.stringify({ message: `Successfully parsed!` })
    };
    
  } catch (error) {
      return {
          statusCode: 500,
          body:  JSON.stringify( { message: error.message || 'Something went wrong !!!' })
      };
  }
}