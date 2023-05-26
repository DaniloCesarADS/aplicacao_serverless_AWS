## Implementação de serviço Serverless com banco de dados NoSQL na AWS

#### Projeto de aplicação

Implementação de serviço de banco de dados NoSQL em ambiente de computação Serverless utilizando conceitos de Infraestrutura como Código.

Mais precisamente, configurar um arquivo de configuração "serverless.yml" que, ao ser realizado o seu deploy, implementa e provisiona toda a infraestrutura criada no serviço de nuvem, que no caso é a AWS.

Segue a relação de serviços utilizados:

- AWS Lambda >> Funções de CRUD;
- AWS Dynamo DB >> Serviço de Database NoSQL da AWS;
- AWS API Gateway >> Serviço de Endpoints.Trigger para acionamento das nossas funções lambda via http;
- AWS CloudFormation >> Serviço de provisionamento de IaaC. Monta e implementa todo o nosso projeto na AWS.

#### Arquitetura da solução:

O Serveless Framework (serverless.yml) é o arquivo que vai chamar o CloudFormation, que forma uma infra que interage com outros três serviços: o AWS API Gateway, que gera os endpoints para teste via Postman para enviarmos os dados para as respectivas funções do AWS lambda, que por sua vez armazenam esses dados no AWS Dynamo DB, nosso Banco de dados NoSQL.

#### Vantagens de implementações em Serverless:

- Apropriado para aplicações de desenvolvimento, em que pode não ser eficiente empreender tempo e energia para dimensionarmos infraestrutura ou que não conhecemos de antemão o seu consumo de recursos.
- A AWS provisiona toda a infra para o desenvolvedor e o mesmo pode focar no que seu projeto deve implementar.
- O serviço de Serverless é mais orientado a microsserviços, o que permite que implementemos as funcionalidades separadamente e tratar erros e evoluções de forma independente. Uma falha de um componente não afeta os outros. Assim podemos isolar os erros e bugs de uma implementação, sem ter de interromper as outras para atuar.

#### Planejamento das etapas de implementação:

##### Etapa ZERO - Requisitos para a nossa máquina local:

- Ter conta ativa na AWS;
- Ter o node.js instalado na máquina;
- Ter o AWS CLI instalado;
- Ter o VSCode instalado;
- Ter o Postman instalado para a realização de testes dos endpoints.

##### Etapa 1 - Criação do usuário do projeto:

De cara, uma BOA PRÁTICA >> NÃO UTILIZE O SEU USUÁRIO RAÍZ para os teus trabalhos. Mas por que?

O teu usuário Raíz, ou root, é o usuário master do serviço AWS. Com ele você tem acesso a tudo e pode fazer tudo o que o provedor te oferece. Ele serve para você fazer a administração da conta AWS, fornecer e negar direitos de acesso e resolver as questões comerciais e de cobrança pelos serviços utilizados na AWS.

Então para a realização de projetos, você vai sempre designar um usuário com APENAS os acessos necessários para a realização do projeto e novas permissões só devem ser liberadas conforme necessidade e OBSERVADAS as questões de segurança.

A criação do usuário é realizada no console da AWS por meio do serviço IAM. Lá você vai seguir essas etapas:

- Acessar o serviço IAM >> aba "Usuários" (Esq) >> Botão "Adicionar usuários" (Dir);
- Dê um nome de usuário conforme os critérios mostrados na tela;
- A opção de acesso via Console (Este acesso pelo site) é opcional. Para o nosso projeto, como o acesso vai ser programático (Lááá no terminal do Vscode!), então não vamos marcar essa opção, pois o usuário não precisa acessar o site >> Botão "Próximo";
- Vamos utilizar a opção "Anexar políticas diretamente" e escolher as políticas manualmente;
- É uma MÁ PRÁTICA, mas vamos utilizar para este projeto, a política "Administrator Access" para acelerar a nossa implementação. Mas o CORRETO é identificarmos as políticas de acesso de cada serviço que será acessado e utilizado pela nossa aplicação >> Botão "Próximo";
- Na tela de revisão, confirme as configurações >> Botão "Criar usuário";
- Após a criação do usuário, você deve visitar a página do usuário na lista de usuários >> Procurar a aba "Credenciais de acesso" >> subtítulo "Chaves de acesso" >> Botão "Criar chave de Acesso" >> vai ser gerado o par de chaves para o acesso via console >> Baixe essas chaves LOGO NESSE PRIMEIRO ACESSO, depois não é mais possível baixar;
- Acessar o terminal de sua preferência (Exemplo: Powershell, ou o integrado ao VSCode, também) >> Acessar a pasta do projeto >> Comando: aws configure >> inserir as credenciais baixadas >> inserir a região aws que você está utilizando.
- OBS: As opções e layout de tela da AWS costumam sofrer alterações frequentemente. Então pode ser que o sequencial acima se altere dependendo de quando vôce estiver acessando este READ-ME.

##### Etapa 2 - Criação do estado inicial do projeto:

##### Configurar o framework serverless:

Para criarmos nosso projeto, utilizaremos o framework "serverless". No terminal, utilizar o comando abaixo para instalar o pacote de modo global:

##### $  npm i -g serverless

Em seguida, na pasta do projeto, inserir o comando para configurar o projeto - Criar a template e o estado inicial:

##### $  serverless

##### Type: Node.JS Http API

##### Nome: nome do projeto

Ele vai criar a template do projeto com os arquivos default. Só vai faltar o diretório "node modules", que instalaremos nas próximas etapas.

- Arquivo "serverless.yml" >> Seção "provider" >> adicionar a região (como estou usando a região us-east-1 norte da virgínia - EUA, coloquei "region: us-east-1"[Veja a região na página inicial do console AWS]);
- Salve TUDO no VSCode >> no terminal >> $ serverless deploy -v
- Para estruturar o nosso projeto vamos criar uma pasta "src", onde guardamos os arquivos das funções lambda >> Colocar o arquivo "index.js" dentro dela;
- Altere o campo "Handler" do escopo "api", dentro da seção "functions", referente a função no serverless com o novo path: src/index.handler
- Salvar o projeto no VSCode e, no terminal: $  serverless deploy
- Veja o que foi implementado até o momento, onde estão os recursos: no AWS lambda mostra os recursos implantados e no AWS Cloudformation mostra os logs de deploy da aplicação.

##### Etapa 3 - Criando a tabela do Dynamo DB:

No arquivo serverless.yml, você adiciona a seção "Resources" e, nela, instancia e configura a tabela do Dynamo DB.

```
resources:
  Resources:
    TabelaBombom:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: TabelaBombom
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: idBombom
            AttributeType: S
        KeySchema:
          - AttributeName: idBombom
            KeyType: HASH
```

- $  serverless deploy
- Veja a implementação da tabela do Dynamo DB.

##### Etapa 4 - Criação das funções Lambda e testes de unidade:

Aqui começamos a criar e implementar as funções que acessarão o nosso banco de dados do Dynamo DB, que já está na nuvem.

##### Configuração no arquivo "serverless.yml":

Dentro da seção "provider", adicionamos um escopo "iam", onde configuramos uma role descrevendo as ações de acesso e o "resource" de referência, que é o identificador (ARN) da tabela do DynamoDB criada para o projeto. Esse ARN, pegamos lááá na página do DynamoDB no Console AWS.

Segue o exemplo do código aplicado:

```
# Configurando as permissões da Role para o Dynamo db no IAM #
  iam:
    role:
        statements:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
              - dynamodb:UpdateItem
              - dynamodb:GetItem
              - dynamodb:scan
            Resource:
              - arn:aws:dynamodb:us-east-1:020164141565:table/TabelaBombom
```

  ##### Função de inserir itens:

- Na pasta "src", criar o arquivo "insertItem.js";

- Vamos precisar da biblioteca uuid. Para isso precisamos instalar a dependência;

-  No terminal - iniciar o npm: $  npm init

- $  npm i uuid aws-sdk

- Após a instalação do uuid, aparecerá a pasta node modules no projeto. No meu caso, pulei esta etapa e depois deu problema com erro 500 nos testes via postman.

- Depois de criar a função conforme o arquivo do projeto, precisamos atualizar a seção "functions:" do serverless.yml, adicionando a configuração dela e dos paths necessários;

  ```
  functions:
    api:
      handler: src/index.handler
      events:
        - httpApi:
            path: /
            method: get
    insertItem:
      handler: src/insertItem.handler
      events:
        - httpApi:
            path: /item
            method: post
  ```

  

- Fazer o deploy >> Conferir a implementação no Lambda >> Criar a requisição no Postman para teste >> inserir nela o link de Endpoint da função criado no terminal com a conclusão do deploy.

##### Etapa 5 - Criação da função de listar todos os itens e testes de unidade:

- Na pasta "src", criar o arquivo "listItems.js";

- Depois de criar a função conforme o arquivo do projeto, precisamos atualizar a seção "functions:" do serverless.yml, adicionando a configuração dela e dos paths necessários. Adicionar na seção "functions":

  ```
  listItems:
      handler: src/listItems.handler
      events:
        - httpApi:
            path: /items
            method: get
  ```

- Fazer o deploy >> Conferir a implementação no Lambda >> Criar a requisição no Postman para teste >> inserir nela o link de Endpoint da função criado no terminal com a conclusão do deploy.

##### Etapa 6 - Criação da função de retornar 1 item e testes de unidade:

- Na pasta "src", criar o arquivo "fetchoneItem.js";

- Depois de criar a função conforme o arquivo do projeto, precisamos atualizar a seção "functions:" do serverless.yml, adicionando a configuração dela e dos paths necessários. Adicionar na seção "functions":

  ```
  fetchoneItem:
      handler: src/fetchoneItem.handler
      events:
        - httpApi:
            path: /items/{idBombom}
            method: get
  ```

- Fazer o deploy >> Conferir a implementação no Lambda >> Criar a requisição no Postman para teste >> inserir nela o link de Endpoint da função criado no terminal com a conclusão do deploy.

##### Etapa 7 - Criação da função de atualização de item e testes de unidade:

- Na pasta "src", criar o arquivo "updateItem.js";

- Depois de criar a função conforme o arquivo do projeto, precisamos atualizar a seção "functions:" do serverless.yml, adicionando a configuração dela e dos paths necessários. Adicionar na seção "functions":

  ```
  updateItem:
      handler: src/updateItem.handler
      events:
        - http:
            path: /items/{idBombom}
            method: put
  ```

- Fazer o deploy >> Conferir a implementação no Lambda >> Criar a requisição no Postman para teste >> inserir nela o link de Endpoint da função criado no terminal com a conclusão do deploy.

##### Etapa 8 - Testes de integração:

Uma vez que tudo foi implementado, podemos fazer algumas requisições para testar TODAS as funcionalidades via Postman. Se alguma requisição der erro, é preciso verificar qual é ele para fazer o tratamento adequado. No meu caso, deu 2 vezes erro 500 no retorno da requisição via Postman - Erro interno do servidor. 

- Um deles foi relativo a função fetchoneItem: Escrevi certo no arquivo da função e errado no serverless. Aí a requisição dava erro. Corrigir o serverless.yml e dar novo deploy resolveu o problema.
- O outro foi relativo a biblioteca uuid aws-sdk como mencionado algumas etapas acima. Depois de pesquisar bastante, vi que o erro era que não havia resolvido a dependência corretamente para criar o diretório "node_modules". Aí a requisição chegava ao servidor e dava erro de biblioteca. Iniciar o npm e instalar a uuid novamente resolveu o problema, após novo deploy na nuvem.

##### Etapa 9 - Remoção do serviço Serverless:

Caso você tenha implementado este projeto para fins EDUCACIONAIS APENAS, recomendo fortemente que você destrua o projeto no momento em que não mais for utilizar, pois alguns serviços como o Dynamo DB, podem sofrer alguma cobrança inesperada caso fique implementado por tempo indeterminado. Alguns serviços NÃO SÃO COBERTOS PELO PLANO FREE TIER OU POSSUEM COBERTURA LIMITADA, passando a cobrar os custos excedentes ao Free tier.

Para remover teu serviço serverless, logue com o seu usuário no terminal e execute o comando abaixo:

##### $  serverless remove

Após a execução do comando, verifique na plataforma se os serviços relativos ao projeto foram todos removidos.

Deve sobrar somente o usuário do projeto para ser excluído. Aí você vai no iam, remove as políticas concedidas e, por fim, exclua o usuário do projeto e descarte as chaves de acesso.

##### Desafios enfrentados:

Os desafios que encontrei ao realizar este projeto foram:

- Entender uma mudança nas opções do comando serverless: a opção correspondente para o projeto era a "Node.JS Http Api";
- 1ª Execução do comando serverless: problema de permissão do Powershell. Alterar essa permissão do Powershell liberou a execução do Script;
- Erro 500 por resolução incorreta de dependência;
- Erro 500 por erro de sintaxe no Serverless.yml.







 





