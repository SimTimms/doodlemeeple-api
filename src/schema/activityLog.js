import { ActivityLogTC } from '../models';

const ActivityLogQuery = {
  activityLogById: ActivityLogTC.getResolver('findById'),
  activityLogByIds: ActivityLogTC.getResolver('findByIds'),
  activityLogOne: ActivityLogTC.getResolver('findOne'),
  activityLogMany: ActivityLogTC.getResolver('findMany'),
  activityLogCount: ActivityLogTC.getResolver('count'),
  activityLogConnection: ActivityLogTC.getResolver('connection'),
  activityLogPagination: ActivityLogTC.getResolver('pagination'),
};

const ActivityLogMutation = {
  activityLogCreateOne: ActivityLogTC.getResolver('createOne'),
  activityLogCreateMany: ActivityLogTC.getResolver('createMany'),
  activityLogUpdateById: ActivityLogTC.getResolver('updateById'),
  activityLogUpdateOne: ActivityLogTC.getResolver('updateOne'),
  activityLogUpdateMany: ActivityLogTC.getResolver('updateMany'),
  activityLogRemoveById: ActivityLogTC.getResolver('removeById'),
  activityLogRemoveOne: ActivityLogTC.getResolver('removeOne'),
  activityLogRemoveMany: ActivityLogTC.getResolver('removeMany'),
};

export { ActivityLogQuery, ActivityLogMutation };
