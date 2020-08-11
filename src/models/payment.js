import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, ContractTC } from './';
import timestamps from 'mongoose-timestamp';

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
