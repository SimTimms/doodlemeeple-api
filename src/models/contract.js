import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, PaymentTC, JobTC, PaymentTermsTC, Job, User } from './';
import { getUserId } from '../utils';
import { emailQuote } from '../email';

export const ContractSchema = new Schema(
  {
    notes: { type: String },
    deadline: { type: String },
    cost: { type: String },
    currency: { type: String },
    status: { type: String },
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
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

ContractTC.addRelation('job', {
  resolver: () => JobTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
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
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args.jobId;
    const contract = await Contract.findOne({ _id: rp.args._id, user: userId });
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

    return contract;
  },
});
