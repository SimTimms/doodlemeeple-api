import { NotableProjectTC } from '../models';

const NotableProjectQuery = {
  notableProjectById: NotableProjectTC.getResolver('findById'),
  notableProjectByIds: NotableProjectTC.getResolver('findByIds'),
  notableProjectOne: NotableProjectTC.getResolver('findOne'),
  notableProjectMany: NotableProjectTC.getResolver('findMany'),
  notableProjectCount: NotableProjectTC.getResolver('count'),
  notableProjectConnection: NotableProjectTC.getResolver('connection'),
  notableProjectPagination: NotableProjectTC.getResolver('pagination'),
};

const NotableProjectMutation = {
  notableProjectCreateOne: NotableProjectTC.getResolver('createOne'),
  notableProjectCreateMany: NotableProjectTC.getResolver('createMany'),
  notableProjectUpdateById: NotableProjectTC.getResolver('updateById'),
  notableProjectUpdateOne: NotableProjectTC.getResolver('updateOne'),
  notableProjectUpdateMany: NotableProjectTC.getResolver('updateMany'),
  notableProjectRemoveById: NotableProjectTC.getResolver('removeById'),
  notableProjectRemoveOne: NotableProjectTC.getResolver('removeOne'),
  notableProjectRemoveMany: NotableProjectTC.getResolver('removeMany'),
};

export { NotableProjectQuery, NotableProjectMutation };
