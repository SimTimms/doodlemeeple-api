"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _apolloServerExpress = require("apollo-server-express");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _awsUpload = require("./aws-upload");

var _mongoose = _interopRequireDefault(require("mongoose"));

require("./utils/db");

var _schema = _interopRequireDefault(require("./schema"));

var _cors = _interopRequireDefault(require("cors"));

var _models = require("./models");

var _notifications = require("./utils/notifications");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02'
});

_dotenv.default.config();

const app = (0, _express.default)();
const server = new _apolloServerExpress.ApolloServer({
  schema: _schema.default,
  cors: true,
  playground: process.env.NODE_ENV === 'development' ? true : false,
  introspection: true,
  tracing: true,
  path: '/graphql',
  context: ({
    req
  }) => req
});
app.use((0, _cors.default)());
app.post('/webhook', _bodyParser.default.raw({
  type: 'application/json'
}), async (request, response) => {
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
        await _models.Payment.updateOne({
          paymentId: event.data.object.payment_intent
        }, {
          status: 'charge_succeeded'
        });
        const payment = await _models.Payment.findOne({
          paymentId: event.data.object.payment_intent
        });
        const contract = await _models.Contract.findOne({
          _id: payment.contract
        });
        await _models.Contract.updateOne({
          _id: contract._id
        }, {
          status: 'paid'
        });
        await _models.Job.updateOne({
          _id: contract.job._id
        }, {
          submitted: 'paid'
        });
        const client = await _models.User.findOne({
          _id: contract.signedBy
        });
        const notificationMessage = { ..._notifications.CONTRACT_PAID
        };
        notificationMessage.message = `${client.name} has deposited ${payment.amount / 100} ${payment.currency} into our holding account`;
        notificationMessage.linkTo = `${notificationMessage.linkTo}${contract._id}`;
        await _models.Notification.create({ ...notificationMessage,
          user: contract.user._id
        });
        break;

      case 'payment_intent.created':
        console.log('PaymentIntent Created!');
        break;

      default:
        // Unexpected event type
        return response.status(400).end();
    } // Return a response to acknowledge receipt of the event


    response.json({
      received: true
    });
  } catch (err) {
    console.log(err.message);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
}); //BodyParser must be after Stripe post so Stripe can use raw body.

app.use(_bodyParser.default.json());
app.post('/sign_s3', (req, res) => {
  (0, _awsUpload.sign_s3)(req, res);
});
const endpointSecret = process.env.STRIPE_SIGNATURE;
server.applyMiddleware({
  app,
  path: '/',
  cors: true,
  onHealthCheck: () => // eslint-disable-next-line no-undef
  new Promise((resolve, reject) => {
    if (_mongoose.default.connection.readyState > 0) {
      resolve();
    } else {
      reject();
    }
  })
});
app.listen({
  port: process.env.PORT
}, () => {});