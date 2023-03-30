import { GetObjectCommand } from 'aws-sdk'
import csv from 'csv-parser'

const s3 = new S3Client({ region: 'eu-west-1' });
const BUCKET = 'uploaded-bucket-gwjf';

export const importFileParser = async () => {
  const params = {
    Bucket: BUCKET,
    Key: event?.Records[0]?.s3?.object?.key,
  };
  const results = [];
  try {
      const command = new GetObjectCommand(params);
      const s3Stream = await s3.send(command);

      s3Stream.Body
          .pipe(csv())
          .on('data', (data) => {
              console.log(data);
              results.push(data);
          })
          .on('error', () => {
              return {
                statusCode: 400,
                body: JSON.stringify({ message: `Invalid Request!` })
              };
          })
          .on('end', async () => {
              console.log('Successfully parsed!', results);
              return {
                statusCode: 202,
                body: JSON.stringify({ message: `Successfully parsed!` })
              };
          });
  } catch (error) {
      return {
          statusCode: 500,
          body:  JSON.stringify( { message: error.message || 'Something went wrong !!!' })
      };
  }
}