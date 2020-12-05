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
import {
  withdrawPaymentEmail,
  withdrawFailedEmail,
  withdrawFailedEmailAdmin,
  noStripeEmailAdmin,
} from '../email';

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

    if (!creative.stripeClientId && !creative.stripeID) {
      const stripeSetupEmail = noStripeEmailAdmin({
        name: creative.name,
        email: creative.email,
      });

      stripeSetupEmail
        .then((result) => {})
        .catch((err) => {
          console.log(err);
        });
      return 'STRIPE SETUP';
    }

    const job = await Job.findOne({
      _id: contract.job,
    });

    const stripe = require('stripe')(process.env.STRIPE_KEY, {
      apiVersion: '2020-03-02',
    });

    const balanceAmount = await stripe.balance.retrieve();
    if (balanceAmount.available[0].amount > 0) {
      try {
        const transfer = !creative.stripeClientId
          ? await stripe.transfers.create({
              amount: paymentTerm.percent * 90,
              currency: contract.currency.toLowerCase(),
              destination: `${creative.stripeID}`,
            })
          : await stripe.transfers.create({
              amount: paymentTerm.percent * 90,
              currency: contract.currency.toLowerCase(),
              destination: `${creative.stripeClientId}`,
            });

        await PaymentTerms.updateOne(
          {
            _id: rp.args._id,
          },
          { paid: 'success' }
        );

        await Notification.create({
          ...WITHDRAW_APPROVED,
          user: contract.user._id,
          linkTo: `${WITHDRAW_REQUEST.linkTo}${job._id}`,
        });

        const request = withdrawPaymentEmail({
          name: creative.name,
          email: creative.email,
          amount: paymentTerm.percent,
          currency: contract.currency,
        });
        request
          .then((result) => {})
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        withdrawFailed(contract, creative, paymentTerm, job);

        const zeroCost = err.raw.message.indexOf('must be greater than') > -1;
        const stripeSetup = err.raw.message.indexOf('No such destination') > -1;

        const stripeSetupEmail = withdrawFailedEmail({
          name: creative.name,
          email: creative.email,
          amount: paymentTerm.percent,
          currency: contract.currency,
        });

        stripeSetup &&
          stripeSetupEmail
            .then((result) => {})
            .catch((err) => {
              console.log(err);
            });

        return stripeSetup
          ? 'STRIPE SETUP'
          : zeroCost
          ? 'GREATER_ZERO'
          : `Fail: ${err}`;
      }

      return 'ok';
    } else {
      const request = withdrawFailedEmailAdmin({
        name: creative.name,
        email: creative.email,
        amount: paymentTerm.percent,
        currency: contract.currency,
      });
      request
        .then((result) => {})
        .catch((err) => {
          console.log(err);
        });
      return 'zero_account';
    }
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
