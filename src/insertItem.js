"use strict";

const {v4} = require("uuid");
const AWS = require("aws-sdk");

const insertItem = async (event) => {

    // Gerar o item a partir do JSON
    const {item} = JSON.parse(event.body);
    const createdAt = new Date().toISOString();
    const idBombom = v4();

    // Chamar o DynamoDB
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Criar o item para a inserção no dynamoDB à partir dos dados do JSON
    const newItem = {
        idBombom,
        item,
        createdAt,
        itemStatus: false
    };

    await dynamoDB.put(
        {
            TableName:"TabelaBombom",
            Item: newItem
        }
    ).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(newItem)
    };
};

module.exports = {
    handler:insertItem
}