const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    })
  : new AWS.DynamoDB.DocumentClient();
const TableName = 'todos';

const getDateTime = () => {
  const date = new Date();
  const dateTime = date
    .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    .split(/\/| |:/g)
    .map((str) => (str.length === 1 ? str.padStart(2, 0) : str))
    .join('');
  return dateTime;
};

exports.handler = async (event) => {
  let statusCode;
  let body;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'PATCH',
    'Access-Control-Allow-Origin': '*',
  };

  const id = event.pathParameters.id;
  const { todo, completed } = JSON.parse(event.body);

  if (!id || !todo || completed === undefined) {
    return {
      statusCode: 403,
      body: JSON.stringify('Forbidden'),
      headers,
    };
  }

  const updatedAt = getDateTime();

  const params = {
    TableName,
    Key: { id },
    UpdateExpression: 'set #todo = :t, #completed = :c, #updatedAt = :u',
    ExpressionAttributeNames: {
      '#todo': 'todo',
      '#completed': 'completed',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':t': todo,
      ':c': completed,
      ':u': updatedAt,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const res = await dynamodb.update(params).promise();
    statusCode = 200;
    body = JSON.stringify({ id, ...res.Attributes });
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
