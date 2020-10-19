import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, ContractTC, Contract } from './';
import timestamps from 'mongoose-timestamp';
import { getUserId } from '../utils';
const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});

export const PaymentSchema = new Schema(
  {
    amount: { type: String },
    currency: { type: String },
    status: { type: String },
    paymentId: { type: String },
    account: { type: String },
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
    await Contract.updateOne({ _id: contractId }, { status: 'pending' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: contract.cost * 110,
      currency: contract.currency.toLowerCase() || 'gbp',
      metadata: { integration_check: 'accept_a_payment' },
    });

    await Payment.create({
      amount: contract.cost,
      currency: contract.currency,
      status: 'Incomplete',
      account: 'holding',
      paidBy: userId,
      contract: contractId,
      paymentId: paymentIntent.id,
    });

    await Payment.create({
      amount: contract.cost * 0.1,
      currency: contract.currency,
      status: 'Incomplete',
      account: 'commission',
      paidBy: userId,
      contract: contractId,
      paymentId: paymentIntent.id,
    });
    return paymentIntent.client_secret;
  },
});

PaymentTC.addResolver({
  name: 'requestWithdraw',
  type: 'String',
  args: {
    paymentId: 'String!',
  },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: contract.cost * 110,
      currency: contract.currency.toLowerCase() || 'gbp',
      metadata: { integration_check: 'accept_a_payment' },
    });

    await Payment.create({
      amount: contract.cost,
      currency: contract.currency,
      status: 'Incomplete',
      account: 'holding',
      paidBy: userId,
      contract: contractId,
      paymentId: paymentIntent.id,
    });

    await Payment.create({
      amount: contract.cost * 0.1,
      currency: contract.currency,
      status: 'Incomplete',
      account: 'commission',
      paidBy: userId,
      contract: contractId,
      paymentId: paymentIntent.id,
    });
    return paymentIntent.client_secret;
  },
});
