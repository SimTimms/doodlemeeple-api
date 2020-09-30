import { PaymentTC } from '../models';

const PaymentQuery = {
  paymentById: PaymentTC.getResolver('findById'),
  paymentByIds: PaymentTC.getResolver('findByIds'),
  paymentOne: PaymentTC.getResolver('findOne'),
  paymentMany: PaymentTC.getResolver('findMany'),
  paymentCount: PaymentTC.getResolver('count'),
  paymentConnection: PaymentTC.getResolver('connection'),
  paymentPagination: PaymentTC.getResolver('pagination'),
};

const PaymentMutation = {
  paymentCreateOne: PaymentTC.getResolver('createOne'),
  paymentCreateMany: PaymentTC.getResolver('createMany'),
  paymentUpdateById: PaymentTC.getResolver('updateById'),
  paymentUpdateOne: PaymentTC.getResolver('updateOne'),
  paymentUpdateMany: PaymentTC.getResolver('updateMany'),
  paymentRemoveById: PaymentTC.getResolver('removeById'),
  paymentRemoveOne: PaymentTC.getResolver('removeOne'),
  paymentRemoveMany: PaymentTC.getResolver('removeMany'),
  makePayment: PaymentTC.getResolver('makePayment'),
  requestWithdraw: PaymentTC.getResolver('requestWithdraw'),
};

export { PaymentQuery, PaymentMutation };
