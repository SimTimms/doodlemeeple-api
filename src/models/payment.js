import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, ContractTC, Contract } from './';
import timestamps from 'mongoose-timestamp';
import { getUserId } from '../utils';
const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});

const ObjectId = mongoose.Types.ObjectId;
export const PaymentSchema = new Schema(
  {
    amount: { type: String },
    currency: { type: String },
    status: { type: String },
    paymentId: { type: String },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  {
    collection: 'payments',
  }
);

PaymentSchema.plugin(timestamps);
PaymentSchema.index({ createdAt: 1, updatedAt: 1 });

export const Payment = mongoose.model('Payment', PaymentSchema);
export const PaymentTC = composeWithMongoose(Payment);

PaymentTC.addRelation('paidBy', {
  resolver: () => UserTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.paidBy,
  },
  projection: { id: true },
});

PaymentTC.addRelation('contract', {
  resolver: () => ContractTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.contract,
  },
  projection: { id: true },
});

PaymentTC.addResolver({
  name: 'makePayment',
  type: 'String',
  args: {
    contractId: 'MongoID!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const { contractId } = rp.args;

    const contract = await Contract.findOne({ _id: contractId });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: contract.cost * 100,
      currency: contract.currency.toLowerCase() || 'gbp',
      metadata: { integration_check: 'accept_a_payment' },
    });

    const payment = await Payment.create({
      amount: contract.cost * 100,
      currency: contract.currency,
      status: 'Incomplete',
      paidBy: userId,
      contract: contractId,
      paymentId: paymentIntent.id,
    });
    return paymentIntent.client_secret;
  },
});
