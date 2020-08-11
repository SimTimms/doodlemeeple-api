import { PaymentTermsTC } from '../models';

const PaymentTermsQuery = {
  paymentTermsById: PaymentTermsTC.getResolver('findById'),
  paymentTermsByIds: PaymentTermsTC.getResolver('findByIds'),
  paymentTermsOne: PaymentTermsTC.getResolver('findOne'),
  paymentTermsMany: PaymentTermsTC.getResolver('findMany'),
  paymentTermsCount: PaymentTermsTC.getResolver('count'),
  paymentTermsConnection: PaymentTermsTC.getResolver('connection'),
  paymentTermsPagination: PaymentTermsTC.getResolver('pagination'),
};

const PaymentTermsMutation = {
  paymentTermsCreateOne: PaymentTermsTC.getResolver('createOne'),
  paymentTermsCreateMany: PaymentTermsTC.getResolver('createMany'),
  paymentTermsUpdateById: PaymentTermsTC.getResolver('updateById'),
  paymentTermsUpdateOne: PaymentTermsTC.getResolver('updateOne'),
  paymentTermsUpdateMany: PaymentTermsTC.getResolver('updateMany'),
  paymentTermsRemoveById: PaymentTermsTC.getResolver('removeById'),
  paymentTermsRemoveOne: PaymentTermsTC.getResolver('removeOne'),
  paymentTermsRemoveMany: PaymentTermsTC.getResolver('removeMany'),
};

export { PaymentTermsQuery, PaymentTermsMutation };
