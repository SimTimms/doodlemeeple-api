const { getUserId } = require('../../../utils');
const { emailInvite } = require('../../../email');
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
  const messageId = args.id;
  const { messageStr, job, receiver } = args.message;

  const returnObj = await context.prisma.createMessage({
    sender: { connect: { id: userId } },
    messageStr,
    job: { connect: { id: job } },
    receiver: { connect: { id: receiver } },
    status: 'unread',
  });
  MESSAGE_SENT.message = "There's a message for you";
  createNotification(MESSAGE_SENT, receiver, context);
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
