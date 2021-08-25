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
const ObjectId = mongoose.Types.ObjectId;

export const ContractSchema = new Schema(
  {
    notes: { type: String },
    deadline: { type: String },
    startDate: { type: String },
    cost: { type: String },
    currency: { type: String },
    status: { type: String },
    signedDate: { type: Date },
    seenByOwner: { type: Boolean },
    seenByJobOwner: { type: Boolean },
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
    jobOwner: {
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

ContractTC.addResolver({
  name: 'quoteWidget',
  args: { status: ['String'] },
  type: [ContractTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const quotes = await Contract.find({
      $and: [{ user: userId }, { status: { $in: rp.args.status } }],
    }).sort({ createdAt: -1 });

    await Contract.updateOne(
      {
        $and: [{ user: userId }, { status: { $in: rp.args.status } }],
      },
      {
        seenByOwner: true,
      }
    );

    return quotes;
  },
});

ContractTC.addResolver({
  name: 'jobContract',
  args: { jobId: 'MongoID!' },
  type: ContractTC,
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const quote = await Contract.findOne({
      user: userId,
      job: rp.args.jobId,
    });

    if (quote) {
      await Contract.updateOne({ _id: quote._id }, { seenByOwner: true });

      return quote;
    }
  },
});

ContractTC.addResolver({
  name: 'jobResponsesWidget',
  args: { jobId: 'MongoID!' },
  type: [ContractTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const quotes = await Contract.find({
      jobOwner: userId,
      $and: [{ status: { $ne: 'draft' } }, { status: { $ne: 'declined' } }],
      job: rp.args.jobId,
    });

    return quotes;
  },
});

ContractTC.addResolver({
  name: 'quoteInWidget',
  args: { jobId: 'MongoID!' },
  type: [ContractTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const quotes = await Contract.find({
      jobOwner: userId,
      job: rp.args.jobId,
      status: 'submitted',
    });

    return quotes;
  },
});

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
      return { contract: parent._id };
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
    //Get required data to continue
    const userId = getUserId(rp.context.headers.authorization);
    const contractId = rp.args._id;
    const contract = await Contract.findOne({ _id: contractId, user: userId });
    const job = await Job.findOne({ _id: ObjectId(contract.job) }, { user: 1 });

    const creator = await User.findOne(
      { _id: ObjectId(job.user) },
      { email: 1, name: 1 }
    );
    const creative = await User.findOne({ _id: userId }, { email: 1, name: 1 });

    //Update Data
    await Contract.updateOne(
      { _id: rp.args._id, user: userId },
      { status: 'submitted', seenByOwner: true, seenByJobOwner: false }
    );

    await Invite.updateOne(
      {
        job: ObjectId(contract.job),
        receiver: ObjectId(userId),
      },
      { status: 'quote_sent' }
    );

    await Job.update(
      { _id: contract.job },
      { $addToSet: { contracts: rp.args._id } }
    );

    const request = emailQuote(creator, contract, creative);
    request
      .then((result) => {})
      .catch((err) => {
        console.log(err);
      });

    const notificationMessage = { ...CONTRACT_SUBMITTED };
    notificationMessage.message = `${creative.name} has quoted ${contract.cost}${contract.currency}`;
    notificationMessage.linkTo = `${notificationMessage.linkTo}${job._id}`;
    Notification.create({
      ...notificationMessage,
      user: creator._id,
      sender: creative._id,
    });

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
      { status: 'declined', seenByOwner: false, seenByJobOwner: true }
    );

    await Job.updateOne(
      { _id: contract.job },
      { $pull: { contracts: rp.args._id } }
    );

    await Invite.updateOne(
      {
        job: ObjectId(contract.job),
        receiver: ObjectId(contract.user),
      },
      { status: 'declined' }
    );

    const request = emailDeclineQuote(creative, contract, client);
    request
      .then((result) => {
        //  console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });

    const notificationMessage = { ...CONTRACT_DECLINED };

    notificationMessage.message = `${client.name} rejected your quote`;
    notificationMessage.linkTo = `${notificationMessage.linkTo}${contract.job}`;
    Notification.create({ ...notificationMessage, user: creative._id });

    return contract;
  },
});

ContractTC.addResolver({
  name: 'contractHistory',
  type: [ContractTC],
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);

    const contracts = await Contract.find({
      user: userId,
      status: { $in: ['declined', 'closed', 'deleted'] },
    }).sort({
      updatedAt: -1,
    });

    await Contract.updateMany(
      {
        user: userId,
        status: { $in: ['declined', 'closed'] },
      },
      { seenByOwner: true }
    );

    return contracts;
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

    //Reject all other invites
    await Invite.updateMany(
      {
        receiver: { $ne: creative._id },
        job: contract.job,
      },
      { status: 'rejected' }
    );
    //Accept the chosen invite
    await Invite.updateOne(
      {
        receiver: creative._id,
        job: contract.job,
      },
      { status: 'accepted' }
    );

    await Contract.updateOne(
      { _id: rp.args._id, user: creative._id },
      {
        status: 'accepted',
        signedBy: client._id,
        signedDate: new Date(),
        seenByOwner: false,
      }
    );

    await Job.updateOne(
      { _id: contract.job },
      {
        submitted: 'accepted',
        assignedCreative: creative._id,
        activeContract: ObjectId(contract._id),
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

    const notificationMessage = { ...CONTRACT_ACCEPTED };

    notificationMessage.message = `${client.name} ACCEPTED your quote`;
    notificationMessage.linkTo = `${notificationMessage.linkTo}${contract.job}`;
    Notification.create({ ...notificationMessage, user: creative._id });

    return contract;
  },
});
