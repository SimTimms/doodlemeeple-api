import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { sign_s3 } from './aws-upload';
import mongoose from 'mongoose';
import './utils/db';
import schema from './schema';
import cors from 'cors';
import { Payment, Contract, Job, Notification, User } from './models';
import { CONTRACT_PAID } from './utils/notifications';
import { getUserIdWithoutContext } from './utils';

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

app.post(
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
          console.log(event.data.object.payment_intent);

          const paymentDebug = await Payment.findOne({
            paymentId: event.data.object.payment_intent,
          });

          await Payment.updateMany(
            { paymentId: event.data.object.payment_intent },
            { status: 'charge_succeeded' }
          );

          const payment = await Payment.findOne({
            paymentId: event.data.object.payment_intent,
          });

          const contract = await Contract.findOne({ _id: payment.contract });

          await Contract.updateOne({ _id: contract._id }, { status: 'paid' });
          await Job.updateOne({ _id: contract.job }, { submitted: 'paid' });
          const client = await User.findOne({ _id: contract.signedBy });
          const notificationMessage = { ...CONTRACT_PAID };
          notificationMessage.message = `${client.name} has deposited ${payment.amount} ${payment.currency} into our holding account`;
          notificationMessage.linkTo = `${notificationMessage.linkTo}${contract.job}`;
          await Notification.create({
            ...notificationMessage,
            user: contract.user._id,
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
  }
);

async function generateAccountLink(accountID, origin, userId) {
  await User.updateOne({ _id: userId }, { stripeID: accountID });
  return stripe.accountLinks
    .create({
      type: 'account_onboarding',
      account: accountID,
      refresh_url: `${origin}/onboard-user/refresh`,
      return_url: `${origin}/stripe-success`,
    })
    .then((link) => link.url);
}

app.post('/stripe-onboarding', async (req, res) => {
  const userId = getUserIdWithoutContext(req.headers.authorization);

  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      country: 'GB',
      default_currency: 'gbp',
    });
    const origin = `${req.headers.origin}`;
    const accountLinkURL = await generateAccountLink(
      account.id,
      origin,
      userId
    );
    res.send({ url: accountLinkURL });
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

app.get('/stripe-onboarding/refresh', async (req, res) => {
  try {
    // const { accountID } = req.session;
    //  const origin = `${req.secure ? 'https://' : 'https://'}${req.headers.host}`;
    // const accountLinkURL = await generateAccountLink(accountID, origin);
    // res.redirect(accountLinkURL);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
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
