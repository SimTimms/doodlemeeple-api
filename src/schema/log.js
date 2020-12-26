import { LogTC } from '../models';

const LogQuery = {
  logById: LogTC.getResolver('findById'),
  logByIds: LogTC.getResolver('findByIds'),
  logOne: LogTC.getResolver('findOne'),
  logMany: LogTC.getResolver('findMany'),
  logCount: LogTC.getResolver('count'),
  logConnection: LogTC.getResolver('connection'),
  logPagination: LogTC.getResolver('pagination'),
};

const LogMutation = {
  logCreateOne: LogTC.getResolver('createOne'),
  logCreateMany: LogTC.getResolver('createMany'),
  logUpdateById: LogTC.getResolver('updateById'),
  logUpdateOne: LogTC.getResolver('updateOne'),
  logUpdateMany: LogTC.getResolver('updateMany'),
  logRemoveById: LogTC.getResolver('removeById'),
  logRemoveOne: LogTC.getResolver('removeOne'),
  logRemoveMany: LogTC.getResolver('removeMany'),
};

export { LogQuery, LogMutation };
