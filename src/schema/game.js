import { GameTC } from '../models';
import { getUserId } from '../utils';

const GameQuery = {
  gameById: GameTC.getResolver('findById'),
  gameByIds: GameTC.getResolver('findByIds'),
  gameOne: GameTC.getResolver('findOne'),
  gameMany: GameTC.getResolver('findMany'),
  gamesByUser: GameTC.getResolver('gamesByUser'),
  gameCount: GameTC.getResolver('count'),
  gameConnection: GameTC.getResolver('connection'),
  gamePagination: GameTC.getResolver('pagination'),
  featuredGameWidget: GameTC.getResolver('featuredGameWidget'),
  gameWidget: GameTC.getResolver('gameWidget'),
  myGames: GameTC.getResolver('myGames'),
};

const GameMutation = {
  gameCreateOne: GameTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const game = await next(rp);
      return game;
    }
  ),
  gameCreateMany: GameTC.getResolver('createMany'),
  gameUpdateById: GameTC.getResolver('updateById'),
  gameUpdateOne: GameTC.getResolver('updateOne'),
  gameUpdateMany: GameTC.getResolver('updateMany'),
  gameRemoveById: GameTC.getResolver('removeById'),
  gameRemoveOne: GameTC.getResolver('removeOne'),
  gameRemoveMany: GameTC.getResolver('removeMany'),
};

export { GameQuery, GameMutation };
