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
  quoteWidget: ContractTC.getResolver('quoteWidget'),
  quoteInWidget: ContractTC.getResolver('quoteInWidget'),
  jobResponsesWidget: ContractTC.getResolver('jobResponsesWidget'),
  jobContract: ContractTC.getResolver('jobContract'),
  contractHistory: ContractTC.getResolver('contractHistory'),
};

const ContractMutation = {
  contractCreateOne: ContractTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const contractExists = await Contract.findOne({
        job: ObjectId(rp.args.record.job),
        user: userId,
      });

      if (contractExists) {
        return null;
      }

      await Invite.updateOne(
        {
          job: ObjectId(rp.args.record.job),
          receiver: userId,
        },
        { status: 'draft' }
      );

      const job = await Job.findOne({ _id: ObjectId(rp.args.record.job) });
      if (userId === job.user._id) return null;

      rp.args.record.jobOwner = job.user;
      const contract = await next(rp);
      return contract;
    }
  ),
  contractCreateMany: ContractTC.getResolver('createMany'),
  contractUpdateById: ContractTC.getResolver('updateById').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);

      const contract = await Contract.findOne({ _id: rp.args.record._id });

      //This is so that if the contract is changed it is removed from the job

      await Job.update(
        { _id: contract.job },
        { $pull: { contracts: rp.args.record._id } }
      );

      await Invite.update(
        { job: contract.job, user: userId },
        { status: 'read' }
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
      let totalCost = 0;
      if (paymentTerms) {
        for (let i = 0; i < paymentTerms.length; i++) {
          totalCost = totalCost + paymentTerms[i].percent;
        }
      }

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
