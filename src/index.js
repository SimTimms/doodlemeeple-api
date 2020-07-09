import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
const bodyParser = require('body-parser');
const { sign_s3 } = require('./aws-upload');
import mongoose from 'mongoose';
import './utils/db';
import schema from './schema';

dotenv.config();

const app = express();

const server = new ApolloServer({
  schema,
  cors: true,
  playground: process.env.NODE_ENV === 'development' ? true : false,
  introspection: true,
  tracing: true,
  path: '/graphql',
  context: ({ req }) => req,
});

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: true,
  onHealthCheck: () =>
    // eslint-disable-next-line no-undef
    new Promise((resolve, reject) => {
      if (mongoose.connection.readyState > 0) {
        resolve();
      } else {
        reject();
      }
    }),
});

app.use(bodyParser.json());
app.post('/sign_s3', (req, res) => {
  sign_s3(req, res);
});

app.listen({ port: process.env.PORT }, () => {});
