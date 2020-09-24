import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { ContractTC, Notification, Contract, Job, User } from './';
import timestamps from 'mongoose-timestamp';
import { getUserId } from '../utils';
import {
  WITHDRAW_REQUEST,
  WITHDRAW_APPROVED,
  WITHDRAW_FAILED,
} from '../utils/notifications';
import { withdrawPaymentEmail, withdrawFailedEmail } from '../email';

const ObjectId = mongoose.Types.ObjectId;
export const PaymentTermsSchema = new Schema(
  {
    percent: { type: Number },
    description: { type: String },
    withdrawRequest: { type: Boolean },
    withdrawApproved: { type: Boolean },
    withdrawPaid: { type: String },
    paid: { type: String },
    status: { type: String },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  {
    collection: 'paymentTerms',
  }
);

PaymentTermsSchema.plugin(timestamps);
PaymentTermsSchema.index({ createdAt: 1, updatedAt: 1 });

export const PaymentTerms = mongoose.model('PaymentTerms', PaymentTermsSchema);
export const PaymentTermsTC = composeWithMongoose(PaymentTerms);

PaymentTermsTC.addRelation('contract', {
  resolver: () => ContractTC.getResolver('findById'),
  prepareArgs: {
    _id: (parent) => parent.contract,
  },
  projection: { id: true },
});

PaymentTermsTC.addResolver({
  name: 'getPaymentTerms',
  args: { contractId: 'String!' },
  type: [PaymentTermsTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const paymentTerms = await PaymentTerms.find({
      contract: { _id: rp.args.contractId, user: { _id: ObjectId(userId) } },
    });

    return paymentTerms;
  },
});

PaymentTermsTC.addResolver({
  name: 'requestWithdraw',
  args: { _id: 'MongoID!' },
  type: 'Boolean',
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const paymentTerm = await PaymentTerms.findOne({
      _id: rp.args._id,
    });

    await PaymentTerms.updateOne(
      {
        _id: rp.args._id,
      },
      { withdrawRequest: true }
    );

    const contract = await Contract.findOne({
      _id: paymentTerm.contract,
    });

    const job = await Job.findOne({
      _id: contract.job,
    });

    await Notification.create({
      ...WITHDRAW_REQUEST,
      user: job.user._id,
      linkTo: `${WITHDRAW_REQUEST.linkTo}${job._id}`,
    });

    return true;
  },
});

PaymentTermsTC.addResolver({
  name: 'approveWithdraw',
  args: { _id: 'MongoID!' },
  type: 'String',
  kind: 'mutation',
  resolve: async (rp) => {
    const paymentTerm = await PaymentTerms.findOne({
      _id: rp.args._id,
      paid: { $ne: 'success' },
    });

    if (!paymentTerm) {
      throw new Error('Already paid or does not exist');
    }

    await PaymentTerms.updateOne(
      {
        _id: rp.args._id,
      },
      { approveWithdraw: true, status: 'success' }
    );

    const contract = await Contract.findOne({
      _id: paymentTerm.contract,
    });

    const creative = await User.findOne({
      _id: contract.user,
    });

    if (!creative.stripeID) {
      return 'STRIPE SETUP';
    }

    const job = await Job.findOne({
      _id: contract.job,
    });

    const stripe = require('stripe')(process.env.STRIPE_KEY, {
      apiVersion: '2020-03-02',
    });

    await stripe.balance.retrieve(async function (err, balance) {
      const balanceAmount = balance.available[0].amount;

      if (balanceAmount > 0) {
        try {
          const transfer = await stripe.transfers.create({
            amount: paymentTerm.percent * 100,
            currency: contract.currency.toLowerCase(),
            destination: creative.stripeID,
          });

          const success = transfer.response.body.Messages[0].Status;
          success &&
            (await PaymentTerms.updateOne(
              {
                _id: rp.args._id,
              },
              { paid: success }
            ));

          await Notification.create({
            ...WITHDRAW_APPROVED,
            user: contract.user._id,
            linkTo: `${WITHDRAW_REQUEST.linkTo}${job._id}`,
          });

          await withdrawPaymentEmail({
            name: creative.name,
            email: creative.email,
            amount: paymentTerm.percent,
            currency: contract.currency,
          });
        } catch (err) {
          withdrawFailed(contract, creative, paymentTerm, job);
          await withdrawFailedEmail({
            name: creative.name,
            email: creative.email,
            amount: paymentTerm.percent,
            currency: contract.currency,
          });
          return 'fail';
        }

        return 'ok';
      }
      return 'fail';
    });
  },
});

async function withdrawFailed(contract, creative, paymentTerm, job) {
  await PaymentTerms.updateOne(
    {
      _id: paymentTerm._id,
    },
    { withdrawRequest: false, status: 'fail', paid: 'fail' }
  );

  await Notification.create({
    ...WITHDRAW_FAILED,
    user: contract.user._id,
    linkTo: `${WITHDRAW_FAILED.linkTo}${job._id}`,
  });

  await withdrawFailedEmail({
    name: creative.name,
    email: creative.email,
    amount: paymentTerm.percent,
    currency: contract.currency,
  });
}
