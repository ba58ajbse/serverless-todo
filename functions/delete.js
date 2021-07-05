const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://localhost:8000' })
  : new AWS.DynamoDB.DocumentClient();
const TableName = 'todos';

module.exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'DELETE',
    'Access-Control-Allow-Origin': '*',
  };
  let statusCode = 200;
  let body;

  const id = event.pathParameters.id;

  if (!id) {
    return {
      statusCode: 403,
      body: JSON.stringify('Forbidden'),
    };
  }

  const params = {
    TableName,
    Key: { id },
  };

  try {
    await dynamodb.delete(params).promise();
    body = JSON.stringify({ id });
  } catch (error) {
    statusCode = error.statusCode;
    body = JSON.stringify({ statusCode, error: error.message });
  }

  return {
    statusCode,
    body,
    headers,
  };
};
