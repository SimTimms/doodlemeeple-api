import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { ContractTC, Notification, Contract, Job, User } from './';
import timestamps from 'mongoose-timestamp';
import { getUserId } from '../utils';
import { WITHDRAW_REQUEST, WITHDRAW_APPROVED } from '../utils/notifications';
const { withdrawPayment } = require('../email');

const ObjectId = mongoose.Types.ObjectId;
export const PaymentTermsSchema = new Schema(
  {
    percent: { type: Number },
    description: { type: String },
    withdrawRequest: { type: Boolean },
    withdrawApproved: { type: Boolean },
    withdrawPaid: { type: String },
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
      { approveWithdraw: true }
    );

    const contract = await Contract.findOne({
      _id: paymentTerm.contract,
    });

    const job = await Job.findOne({
      _id: contract.job,
    });

    const creative = await User.findOne({
      _id: contract.user,
    });
    await Notification.create({
      ...WITHDRAW_APPROVED,
      user: contract.user._id,
      linkTo: `${WITHDRAW_REQUEST.linkTo}${job._id}`,
    });

    const request = withdrawPayment({
      name: creative.name,
      email: creative.email,
      amount: paymentTerm.percent,
      currency: contract.currency,
    });

    request
      .then((result) => {})
      .catch((err) => {
        console.log(err.statusCode);
      });

    return true;
  },
});
