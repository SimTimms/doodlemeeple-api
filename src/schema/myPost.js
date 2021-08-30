import { MyPostTC } from '../models';
import { getUserId } from '../utils';

const MyPostQuery = {
  myPostById: MyPostTC.getResolver('findById'),
  myPostByIds: MyPostTC.getResolver('findByIds'),
  myPostOne: MyPostTC.getResolver('findOne'),
  myPostMany: MyPostTC.getResolver('findMany'),
  myPostCount: MyPostTC.getResolver('count'),
  myPostConnection: MyPostTC.getResolver('connection'),
  myPostPagination: MyPostTC.getResolver('pagination'),
  featuredMyPostWidget: MyPostTC.getResolver('featuredMyPostWidget'),
  myPostsWidget: MyPostTC.getResolver('myPostsWidget'),
  myPosts: MyPostTC.getResolver('myPosts'),
};

const MyPostMutation = {
  myPostCreateOne: MyPostTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const myPost = await next(rp);
      return myPost;
    }
  ),
  myPostCreateMany: MyPostTC.getResolver('createMany'),
  myPostUpdateById: MyPostTC.getResolver('updateById'),
  myPostUpdateOne: MyPostTC.getResolver('updateOne'),
  myPostUpdateMany: MyPostTC.getResolver('updateMany'),
  myPostRemoveById: MyPostTC.getResolver('removeById'),
  myPostRemoveOne: MyPostTC.getResolver('removeOne'),
  myPostRemoveMany: MyPostTC.getResolver('removeMany'),
};

export { MyPostQuery, MyPostMutation };
