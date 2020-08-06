import { MessageTC } from '../models';
import { getUserId } from '../utils';

const MessageQuery = {
  messageById: MessageTC.getResolver('findById'),
  messageByIds: MessageTC.getResolver('findByIds'),
  messageOne: MessageTC.getResolver('findOne'),
  messageMany: MessageTC.getResolver('findMany'),
  messageCount: MessageTC.getResolver('count'),
  messageConnection: MessageTC.getResolver('connection'),
  messagePagination: MessageTC.getResolver('pagination'),
  getMessages: MessageTC.getResolver('getMessages'),
  getConversations: MessageTC.getResolver('getConversations'),
};

const MessageMutation = {
  messageCreateOne: MessageTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const senderId = getUserId(rp.context.headers.authorization);
      rp.args.record.sender = senderId;
      rp.args.record.status = 'unread';

      const message = await next(rp);
      return message;
    }
  ),
  messageCreateMany: MessageTC.getResolver('createMany'),
  messageUpdateById: MessageTC.getResolver('updateById'),
  messageUpdateOne: MessageTC.getResolver('updateOne'),
  messageUpdateMany: MessageTC.getResolver('updateMany'),
  messageRemoveById: MessageTC.getResolver('removeById'),
  messageRemoveOne: MessageTC.getResolver('removeOne'),
  messageRemoveMany: MessageTC.getResolver('removeMany'),
};

export { MessageQuery, MessageMutation };
