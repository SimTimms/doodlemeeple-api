require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
var express = require('express');
const bodyParser = require('body-parser');
const { sign_s3 } = require('./aws-upload');
const Section = require('./resolvers/Section');

const resolvers = {
  Query,
  Mutation,
  User,
  Section,
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,

  context: request => {
    return {
      ...request,
      prisma,
    };
  },
});

server.start();

const customRouter = express.Router();
customRouter.use(bodyParser.urlencoded({ extended: true }));
customRouter.post('/sign_s3', (req, res) => {
  sign_s3(req, res);
});

server.express.use(customRouter);
