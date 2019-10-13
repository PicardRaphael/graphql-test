const express = require('express');
const expressGraphQL = require('express-graphql');

const UserSchema = require('./schemas/user');

const server = express();
const port = 4000;

// Sur localhost:4000/graphql on utilise l'interface graphique graphiql
server.use("/graphql", expressGraphQL({
        graphiql: true,
        schema: UserSchema
}));

server.listen(port, () => {
        console.log(`Serveur est en écoute sur le ${port}`);
});