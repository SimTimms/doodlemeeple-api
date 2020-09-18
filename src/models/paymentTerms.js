import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { ContractTC } from './';
import timestamps from 'mongoose-timestamp';

const ObjectId = mongoose.Types.ObjectId;
export const PaymentTermsSchema = new Schema(
  {
    percent: { type: Number },
    description: { type: String },
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
