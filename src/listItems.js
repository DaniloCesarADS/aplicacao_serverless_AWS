"use strict";

// Importar Bibliotecas
const AWS = require("aws-sdk");

// Função de Busca para listar todos os itens da tabela...
const listItems = async (event) => {

    // Chamar o DynamoDB
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    let items;

    // Rotina de varredura da tabela para gerar a lista de itens
    // CUIDADO: O Serverless cobra por tempo de processamento, logo o scan pode ser uma operação
    // custosa a depender do tamanho da tabela...
    try {
        const results = await dynamodb.scan({
            TableName: "TabelaBombom"
        }).promise();

        items = results.Items;

    } catch (error) {
        console.log(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(items),
    };
};

module.exports = {
    handler: listItems,
};
