"use strict";

// Importando biblioteca
const AWS = require("aws-sdk")

// Função para atualizar um item existente na tabela do Dynamo DB
const updateItem = async (event) => {
  
  // Parâmetros
  const {itemStatus} = JSON.parse(event.body);
  const {idBombom} = event.pathParameters

  // Chama o Dynamo DB
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  await dynamodb.update({
    TableName: "TabelaBombom",
    Key: {idBombom},
    UpdateExpression: 'set itemStatus = :itemStatus',
    ExpressionAttributeValues: {
      ':itemStatus': itemStatus
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(
      { msg: 'Item updated'}
    ),
  };
};


module.exports = {
    handler:updateItem
}


