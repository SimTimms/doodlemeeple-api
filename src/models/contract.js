import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';
import { getUserId } from '../utils';

export const ContractSchema = new Schema(
  {
    notes: { type: String },
    deadline: { type: String },
    cost: { type: String },
    currency: { type: String },
    status: { type: String },
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

ContractTC.addResolver({
  name: 'contractByJob',
  type: ContractTC,
  args: { jobId: 'MongoID!' },
  kind: 'query',
  resolve: async (rp) => {
    const userId = getUserId(rp.context.headers.authorization);
    const jobId = rp.args.jobId;
    const contract = await Contract.find({ user: userId, job: jobId });
    return contract;
  },
});
