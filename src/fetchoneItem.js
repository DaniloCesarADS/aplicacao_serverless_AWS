"use strict";

// Importando a biblioteca
const AWS = require("aws-sdk");

// Função de busca. Retorna 1 item pesquisado
const fetchoneItem = async (event) => {

    // Chama o Dynamo DB
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const {idBombom} = event.pathParameters

    let item;

    try {
        const result = await dynamodb.get({
            TableName: "TabelaBombom",
            Key: {idBombom}
        }).promise();

        item = result.Item;

    } catch (error) {
        console.log(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(item),
    };
};

module.exports = {
    handler: fetchoneItem,
};
