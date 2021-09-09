import { JobTC, Gallery } from '../models';
import { getUserId } from '../utils';

const JobQuery = {
  jobById: JobTC.getResolver('findById'),
  jobByIds: JobTC.getResolver('findByIds'),
  jobOne: JobTC.getResolver('findOne'),
  jobMany: JobTC.getResolver('findMany'),
  jobsByUser: JobTC.getResolver('jobsByUser'),
  jobCount: JobTC.getResolver('count'),
  jobConnection: JobTC.getResolver('connection'),
  jobPagination: JobTC.getResolver('pagination'),
  jobChecklist: JobTC.getResolver('jobChecklist'),
  jobWidget: JobTC.getResolver('jobWidget'),
  jobBoardWidget: JobTC.getResolver('jobBoardWidget'),
  jobBoardMiniWidget: JobTC.getResolver('jobBoardMiniWidget'),
  jobHistory: JobTC.getResolver('jobHistory'),
  workHistory: JobTC.getResolver('workHistory'),
};

const JobMutation = {
  jobCreateOne: JobTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;
      rp.args.record.submitted = 'draft';

      const gallery = await Gallery.create({});
      rp.args.record.gallery = gallery._id;

      const job = await next(rp);
      return job;
    }
  ),
  jobCreateMany: JobTC.getResolver('createMany'),
  jobUpdateById: JobTC.getResolver('updateById'),
  closeJob: JobTC.getResolver('closeJob'),
  openJob: JobTC.getResolver('openJob'),
  completeJob: JobTC.getResolver('completeJob'),
  jobUpdateOne: JobTC.getResolver('updateOne'),
  jobUpdateMany: JobTC.getResolver('updateMany'),
  jobRemoveById: JobTC.getResolver('removeById'),
  jobRemoveOne: JobTC.getResolver('removeOne'),
  jobRemoveMany: JobTC.getResolver('removeMany'),
  submitBrief: JobTC.getResolver('submitBrief'),
  submitBriefSingle: JobTC.getResolver('submitBriefSingle'),
  acceptTerms: JobTC.getResolver('acceptTerms'),
  submitPublicBrief: JobTC.getResolver('submitPublicBrief'),
  closeEarly: JobTC.getResolver('closeEarly'),
};

export { JobQuery, JobMutation };
