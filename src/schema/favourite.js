import { FavouriteTC, User, Favourite } from '../models';
import { getUserId } from '../utils';

const FavouriteQuery = {
  favouriteById: FavouriteTC.getResolver('findById'),
  favouriteByIds: FavouriteTC.getResolver('findByIds'),
  favouriteOne: FavouriteTC.getResolver('findOne'),
  favouriteMany: FavouriteTC.getResolver('findMany'),
  favouriteCount: FavouriteTC.getResolver('count'),
  favouriteConnection: FavouriteTC.getResolver('connection'),
  favouritePagination: FavouriteTC.getResolver('pagination'),
};

const FavouriteMutation = {
  favouriteCreateOne: FavouriteTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const exists = await Favourite.findOne({
        receiver: rp.args.record.receiver,
        user: userId,
      });

      if (!exists) {
        rp.args.record.user = userId;
        const newFavourite = await next(rp);
        await User.updateOne(
          { _id: userId },
          { $addToSet: { favourites: newFavourite.recordId } }
        );
        await User.updateOne(
          { _id: rp.args.record.receiver },
          { $addToSet: { likedMe: newFavourite.recordId } }
        );
        return newFavourite;
      } else {
        await User.updateOne(
          { _id: userId },
          { $pull: { favourites: exists._id } }
        );
        await User.updateOne(
          { _id: rp.args.record.receiver },
          { $pull: { likedMe: exists._id } }
        );
        await Favourite.deleteOne({ _id: exists._id });
      }
      return exists._id;
    }
  ),
  favouriteCreateMany: FavouriteTC.getResolver('createMany'),
  favouriteUpdateById: FavouriteTC.getResolver('updateById'),
  favouriteUpdateOne: FavouriteTC.getResolver('updateOne'),
  favouriteUpdateMany: FavouriteTC.getResolver('updateMany'),
  favouriteRemoveById: FavouriteTC.getResolver('removeById'),
  favouriteRemoveOne: FavouriteTC.getResolver('removeOne'),
  favouriteRemoveMany: FavouriteTC.getResolver('removeMany'),
};

export { FavouriteQuery, FavouriteMutation };
