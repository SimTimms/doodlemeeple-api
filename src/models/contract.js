import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  UserTC,
  PaymentTC,
  JobTC,
  PaymentTermsTC,
  Job,
  User,
  Notification,
  Invite,
} from './';
import { getUserId } from '../utils';
import { emailQuote, emailDeclineQuote, emailAcceptQuote } from '../email';
import {
  CONTRACT_SUBMITTED,
  CONTRACT_DECLINED,
  CONTRACT_ACCEPTED,
} from '../utils/notifications';

export const ContractSchema = new Schema(
  {
    notes: { type: String },
    deadline: { type: String },
    cost: { type: String },
    currency: { type: String },
    status: { type: String },
    signedDate: { type: Date },
    signedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    payments: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentTerms: { type: Schema.Types.ObjectId, ref: 'PaymentTerm' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'contracts',
  }
);

ContractSchema.plugin(timestamps);
ContractSchema.index({ createdAt: 1, updatedAt: 1 });

export const Contract = mongoose.model('Contract', ContractSchema);
export const ContractTC = composeWithMongoose(Contract);

ContractTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: ({ user }) => {
      return { _id: user };
    },
  },
  projection: { _id: true },
});

ContractTC.addRelation('signedBy', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: ({ signedBy }) => {
      return { _id: signedBy };
    },
  },
  projection: { _id: true },
});

ContractTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findOne'),
  prepareArgs: {
    filter: ({ job }) => {
      return { _id: job };
    },
  },
  projection: { _id: true },
});

ContractTC.addRelation('payments', {
  resolver: () => PaymentTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (parent) => [parent.payments],
  },
  projection: { id: true },
});

ContractTC.addRelation('paymentTerms', {
  resolver: () => PaymentTermsTC.getResolver('findMany'),
  prepareArgs: {
    filter: (parent) => {
      contract: parent._id;
    },
  },
  projection: { id: true },
});

ContractTC.addResolver({
  name: 'contractByJob',
  type: ContractTC,
  args: { jobId: 'MongoID!' },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args.jobId;
    const contract = await Contract.findOne({ user: userId, job: jobId });
    return contract;
  },
});

ContractTC.addResolver({
  name: 'submitContract',
  type: ContractTC,
  args: { _id: 'MongoID!' },
  kind: 'mutation',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args.jobId;
    const contract = await Contract.findOne({ _id: rp.args._id, user: userId });
    await Contract.updateOne(
      { _id: rp.args._id, user: userId },
      { status: 'submitted' }
    );
    const job = await Job.findOne({ job: jobId }, { user: 1 });
    const user = await User.findOne({ _id: job.user }, { email: 1, name: 1 });
    const sender = await User.findOne({ _id: userId }, { email: 1, name: 1 });
    const request = emailQuote(user, contract, sender);
    request
      .then((result) => {
        //  console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });

    await Job.update(
      { _id: contract.job },
      { $addToSet: { contracts: rp.args._id } }
    );

    CONTRACT_SUBMITTED.message = `${sender.name} has quoted ${contract.cost}${contract.currency}`;
    CONTRACT_SUBMITTED.linkTo = `${CONTRACT_SUBMITTED.linkTo}${contract._id}`;
    Notification.create({ ...CONTRACT_SUBMITTED, user: user._id });

    return contract;
  },
});

ContractTC.addResolver({
  name: 'declineContract',
  type: ContractTC,
  args: { _id: 'MongoID!' },
  kind: 'mutation',
  resolve: async (rp) => {
    const clientId = getUserId(rp.context.headers.authorization);
    const client = await User.findOne({ _id: clientId }, { email: 1, name: 1 });
    const contract = await Contract.findOne({ _id: rp.args._id });
    const creative = await User.findOne(
      { _id: contract.user },
      { email: 1, name: 1, _id: 1 }
    );

    await Contract.updateOne(
      { _id: rp.args._id, user: creative._id },
      { status: 'declined' }
    );

    await Job.updateOne(
      { _id: contract.job },
      { $pull: { contracts: rp.args._id } }
    );

    const request = emailDeclineQuote(creative, contract, client);
    request
      .then((result) => {
        //  console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });

    CONTRACT_DECLINED.message = `${client.name} rejected your quote`;
    CONTRACT_DECLINED.linkTo = `${CONTRACT_DECLINED.linkTo}${contract._id}`;
    Notification.create({ ...CONTRACT_DECLINED, user: creative._id });

    return contract;
  },
});

ContractTC.addResolver({
  name: 'signContract',
  type: ContractTC,
  args: { _id: 'MongoID!' },
  kind: 'mutation',
  resolve: async (rp) => {
    const clientId = getUserId(rp.context.headers.authorization);
    const client = await User.findOne({ _id: clientId }, { email: 1, name: 1 });
    const contract = await Contract.findOne({ _id: rp.args._id });

    const creative = await User.findOne(
      { _id: contract.user },
      { email: 1, name: 1, _id: 1 }
    );
    const invite = await Invite.findOne({
      receiver: creative._id,
      job: contract.job,
    });
    await Contract.updateOne(
      { _id: rp.args._id, user: creative._id },
      { status: 'accepted', signedBy: client._id, signedDate: new Date() }
    );
    console.log(invite);
    await Job.updateOne(
      { _id: contract.job },
      {
        $pull: {
          invites: { $ne: invite._id },
          contracts: { $ne: contract._id },
        },
        submitted: 'accepted',
        assignedCreative: creative._id,
      }
    );

    const request = emailAcceptQuote(creative, contract, client);
    request
      .then((result) => {
        //  console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });

    CONTRACT_ACCEPTED.message = `${client.name} ACCEPTED your quote`;
    CONTRACT_ACCEPTED.linkTo = `${CONTRACT_ACCEPTED.linkTo}${contract._id}`;
    Notification.create({ ...CONTRACT_ACCEPTED, user: creative._id });

    return contract;
  },
});