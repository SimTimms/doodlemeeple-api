import { ContractTC, Contract, Job, PaymentTerms, Invite } from '../models';
import mongoose from 'mongoose';
import { getUserId } from '../utils';

const ObjectId = mongoose.Types.ObjectId;
const ContractQuery = {
  contractById: ContractTC.getResolver('findById'),
  contractByIds: ContractTC.getResolver('findByIds'),
  contractOne: ContractTC.getResolver('findOne'),
  contractMany: ContractTC.getResolver('findMany'),
  contractByJob: ContractTC.getResolver('contractByJob'),
  contractCount: ContractTC.getResolver('count'),
  contractConnection: ContractTC.getResolver('connection'),
  contractPagination: ContractTC.getResolver('pagination'),
};

const ContractMutation = {
  contractCreateOne: ContractTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);

      rp.args.record.user = userId;

      const contract = await next(rp);

      return contract;
    }
  ),
  contractCreateMany: ContractTC.getResolver('createMany'),
  contractUpdateById: ContractTC.getResolver('updateById').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const contract = await Contract.findOne({ _id: rp.args.record._id });

      await Invite.updateOne(
        {
          job: ObjectId(contract.job),
          receiver: ObjectId(userId),
        },
        { status: 'unopened' }
      );

      //REFACTOR: I should've commented this before now I'm not sure why the $pull is in there, it may be to stop a creative posting multiple contracts. Find out why it's here and remove if unnecessary.
      await Job.update(
        { _id: contract.job },
        { $pull: { contracts: rp.args.record._id } }
      );

      return next(rp);
    }
  ),
  contractUpdateOne: ContractTC.getResolver('updateOne'),
  contractUpdateMany: ContractTC.getResolver('updateMany'),
  contractRemoveById: ContractTC.getResolver('removeById'),
  contractRemoveOne: ContractTC.getResolver('removeOne'),
  contractRemoveMany: ContractTC.getResolver('removeMany'),
  submitContract: ContractTC.getResolver('submitContract').wrapResolve(
    (next) => async (rp) => {
      const contract = await Contract.findOne({ _id: rp.args._id });
      const paymentTerms = await PaymentTerms.find({
        contract: ObjectId(contract._id),
      });
      console.log(paymentTerms, contract._id);
      let totalCost = 0;
      if (paymentTerms) {
        for (let i = 0; i < paymentTerms.length; i++) {
          console.log(paymentTerms[i].percent);
          totalCost = totalCost + paymentTerms[i].percent;
        }
      }
      console.log(totalCost);

      if (contract.cost - totalCost > 0) {
        await PaymentTerms.create({
          percent: contract.cost - totalCost,
          description: 'Upon completion',
          contract: contract._id,
        });
      }
      return next(rp);
    }
  ),
  declineContract: ContractTC.getResolver('declineContract'),
  signContract: ContractTC.getResolver('signContract'),
};

export { ContractQuery, ContractMutation };
