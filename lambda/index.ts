// parse each request event body (which filled by SQS message). It will store this in a DynamoDB table.
const { DynamoDB } = require('aws-sdk');

exports.handler = async function(event: any) {
  console.log(JSON.stringify(event, undefined, 2));

  const client = new DynamoDB.DocumentClient();

  for (const record of event.Records) {
    const body = record.body ? JSON.stringify(record.body) : { };
    await client.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: record.messageId,
        text: body,
        body,
      }
    }).promise();
  }
};

export {};