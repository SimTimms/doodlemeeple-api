import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { sign_s3 } from './aws-upload';
import mongoose from 'mongoose';
import './utils/db';
import schema from './schema';
import cors from 'cors';
import { Section, User } from './models';
const ObjectId = mongoose.Types.ObjectId;

const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});

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

app.use(cors());

app.get('/3d-artist', async (req, res) => {
  const sections = await Section.find({
    type: { $in: 'mini-painter' },
  });

  const sectionUserIds = sections.map((section) => ObjectId(section.user));

  const users = await User.aggregate([
    {
      $match: {
        $and: [
          { _id: { $in: sectionUserIds } },
          { profileImg: { $ne: '' } },
          { profileImg: { $ne: null } },
        ],
      },
    },
    {
      $project: {
        name: 1,
        summary: 1,
        profileImg: 1,
        createdAt: 1,
        priority: 1,
        lastOn: 1,
        priority: { $ifNull: ['$priority', 5] },
      },
    },
    {
      $sort: {
        lastOn: -1,
        priority: 1,
        createdAt: -1,
      },
    },
    { $limit: 12 },
  ]);
  res.send(users);
});
//BodyParser must be after Stripe post so Stripe can use raw body.
app.use(bodyParser.json());
app.post('/sign_s3', (req, res) => {
  sign_s3(req, res);
});

const endpointSecret = process.env.STRIPE_SIGNATURE;

server.applyMiddleware({
  app,
  path: '/',
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

app.listen({ port: process.env.PORT }, () => {});
