import { ContractTC } from '../models';
import { getUserId } from '../utils';

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
  contractUpdateById: ContractTC.getResolver('updateById'),
  contractUpdateOne: ContractTC.getResolver('updateOne'),
  contractUpdateMany: ContractTC.getResolver('updateMany'),
  contractRemoveById: ContractTC.getResolver('removeById'),
  contractRemoveOne: ContractTC.getResolver('removeOne'),
  contractRemoveMany: ContractTC.getResolver('removeMany'),
  submitContract: ContractTC.getResolver('submitContract'),
};

export { ContractQuery, ContractMutation };
