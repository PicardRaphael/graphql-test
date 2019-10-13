const graphQL = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphQL;

// Company Type
const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id : { type : GraphQLString },
        name : { type : GraphQLString },
        user : {
            type : GraphQLList(UserType),
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then((response) => {
                    return response.data;
                });                
            }
        }
    })
});

// User Type
const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id : { type : GraphQLString },
        firstName : { type : GraphQLString },
        age : { type : GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`).then((response) => {
                    return response.data;
                });
            }
        }
        // si on ne voulait pa récupérer compagnie il faudrait juste ne rien mettre
    })
});

const RootMutationUser = new GraphQLObjectType({
    name: "RooteMutationUser",
    fields: {
        addUser: {
            // Nous renvoie l'utilisateur à jouter
            type: UserType,
            args: {
                firstName: {
                    type: new GraphQLNonNull(GraphQLString),// Obligatoire
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: { 
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.post(`http://localhost:3000/users/`, {
                    firstName: args.firstName, 
                    age: args.age, 
                    companyId: args.companyId
                }).then((response) => {
                    return response.data;
                });
            }
        },
        deleteUser :{
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args) {
                return axios.delete(`http://localhost:3000/users/${args.id}`).then((response) => {
                    return response.data;
                });
            }
        }
    }
});

// Route Query
const RootQueryUser = new GraphQLObjectType({
    name: "RouteQueryTypeUser",
    fields: {
        user: {
            type: UserType,
            args: {
                id: { 
                    type: GraphQLString 
                }
            },
            // Promise
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/users/${args.id}`).then((response) => {
                    return response.data;
                });
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${args.id}`).then((response) => {
                    return response.data;
                });
            }
        }
    }
});

/*
Sur GraphiQL
query{
  user(id:1){
   firstName,
   company{
       name,
       user{
           id
       }
   } 
  }
}

query{
  company(id:"1"){
		name,
    user{
      firstName
  	}
  }
};

ALIAS
query{
  microsoftInfo : company(id:"3"){
		name,
    user{
      firstName
  	}
  },
   appleInfo : company(id:"1"){
		name,
    user{
      firstName
  	}
  }
}

FRAGMEN pour évite répétition 
query{
  microsoftInfo : company(id:"3"){
		name,
    user{
      ...userDetails
  	}
  },
   appleInfo : company(id:"1"){
		name,
    user{
      ...userDetails
  	}
  }
}
fragment userDetails on  User {
  firstName, age, id
}
*/
/*
    MUTATION GRAPHIQL
    mutation{
        addUser(
            firstName: "RPKrypto", 
            age: 32, 
            companyId: "1"
        ){
            id,
            firstName
        }
    }
*/
module.exports = new GraphQLSchema({
    query : RootQueryUser,
    mutation: RootMutationUser
});
