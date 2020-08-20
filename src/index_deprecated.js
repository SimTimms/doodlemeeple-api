require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
var express = require('express');
const bodyParser = require('body-parser');
const { sign_s3 } = require('./aws-upload');
const Section = require('./resolvers/Section');
const Gallery = require('./resolvers/Gallery');
const Game = require('./resolvers/Game');
const Job = require('./resolvers/Job');
const Payment = require('./resolvers/Payment');
const User = require('./resolvers/User');
const Invite = require('./resolvers/Invite');
const Message = require('./resolvers/Message');
const Conversation = require('./resolvers/Conversation');
const Subscription = require('./resolvers/Subscription');
const Contract = require('./resolvers/Contract');
const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});

const resolvers = {
  Query,
  Mutation,
  User,
  Section,
  Gallery,
  Contract,
  Game,
  Job,
  Invite,
  Message,
  Conversation,
  Subscription,
  Payment,
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => {
    return {
      ...request,
      prisma,
    };
  },
});

server.start();

const customRouter = express.Router();
customRouter.use(bodyParser.urlencoded({ extended: true }));

const endpointSecret = process.env.STRIPE_SIGNATURE;

customRouter.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (request, response) => {
    const sig = request.headers['stripe-signature'];
    try {
      let event;

      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('PaymentIntent was successful!');
          break;
        case 'charge.succeeded':
          console.log('Charge was successful!');
          await prisma.updateManyPayments({
            data: { status: 'charge_succeeded' },
            where: { paymentId: event.data.object.payment_intent },
          });

          break;
        case 'payment_intent.created':
          console.log('PaymentIntent Created!');
          break;

        default:
          // Unexpected event type
          return response.status(400).end();
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    } catch (err) {
      console.log(err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
    }
  },
);

customRouter.use(bodyParser.json());
customRouter.post('/sign_s3', (req, res) => {
  sign_s3(req, res);
});

server.express.use(customRouter);
