const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://localhost:8000' })
  : new AWS.DynamoDB.DocumentClient();
const TableName = 'todos';

const getDateTime = () => {
  const date = new Date();
  const dateTime = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/\//g, '-');
  return dateTime;
};

module.exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Origin': '*',
  };
  let statusCode = 200;
  let body;
  const event_body = JSON.parse(event.body);
  const { id, todo } = event_body;

  if (!id || !todo) {
    return {
      statusCode: 403,
      body: JSON.stringify('Forbidden'),
    };
  }

  const dateTime = getDateTime();
  const params = {
    TableName,
    Item: {
      id,
      todo,
      completed: false,
      createdAt: dateTime,
      updatedAt: dateTime,
    },
  };

  try {
    await dynamodb.put(params).promise();
    body = JSON.stringify(params.Item);
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
