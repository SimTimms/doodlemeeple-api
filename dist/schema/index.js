"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlCompose = require("graphql-compose");

var _user = require("./user");

var _section = require("./section");

const schemaComposer = new _graphqlCompose.SchemaComposer();
schemaComposer.Query.addFields({ ..._user.UserQuery,
  ..._section.SectionQuery
});
schemaComposer.Mutation.addFields({ ..._user.UserMutation,
  ..._section.SectionMutation
});
exports.default = schemaComposer.buildSchema();