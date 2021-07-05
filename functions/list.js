const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://localhost:8000' })
  : new AWS.DynamoDB.DocumentClient();
const TableName = 'todos';

module.exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  let statusCode = 200;
  let body;

  try {
    const res = await dynamodb.scan({ TableName }).promise();
    body = JSON.stringify({ todoList: res['Items'] });
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
