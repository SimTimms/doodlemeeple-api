const { getUserId } = require('../../../utils');
const { createNotification } = require('../utils');
const { MESSAGE_SENT } = require('../../../utils/notifications');

async function updateMessage(parent, args, context, info) {
  const {
    name,
    img,
    summary,
    location,
    showreel,
    creativeSummary,
    submitted,
  } = args.message;
  const returnObj = await context.prisma.updateMessage({
    data: {
      name,
      img,
      summary,
      location,
      showreel,
      submitted,
      creativeSummary,
    },
    where: {
      id: args.id,
    },
  });

  return returnObj.id;
}

async function createMessage(parent, args, context, info) {
  const userId = getUserId(context);

  const { messageStr, conversationId } = args.message;

  const conversationUsers = await context.prisma
    .conversation({
      id: conversationId,
    })
    .participants();

  const returnObj = await context.prisma.createMessage({
    sender: { connect: { id: userId } },
    messageStr,
    conversation: { connect: { id: conversationId } },
    status: 'unread',
  });
  MESSAGE_SENT.message = "There's a message for you";

  const results = conversationUsers
    .filter((user) => user.id !== userId)
    .map(async (user) => {
      await createNotification(MESSAGE_SENT, user.id, context);
    });

  Promise.all(results).then();

  return returnObj.id;
}

async function removeMessage(parent, args, context) {
  await context.prisma.deleteMessage({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateMessage,
  createMessage,
  removeMessage,
};
