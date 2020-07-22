"use strict";

const {
  getUserId
} = require('../../../utils');

async function updateInvite(parent, args, context, info) {
  const {
    jobId
  } = args.invite;
  const returnObj = await context.prisma.updateInvite({
    data: {
      status: 'send'
    },
    where: {
      job: {
        id: jobId
      }
    }
  });
  return returnObj.id;
}

async function createInvite(parent, args, context, info) {
  const senderId = getUserId(context);
  const {
    title,
    message,
    gameId,
    jobId,
    userId
  } = args.invite;
  const returnObj = await context.prisma.createInvite({
    receiver: {
      connect: {
        id: userId
      }
    },
    user: {
      connect: {
        id: senderId
      }
    },
    title,
    message,
    game: {
      connect: {
        id: gameId
      }
    },
    job: {
      connect: {
        id: jobId
      }
    }
  });
  return returnObj.id;
}

async function removeInvite(parent, args, context) {
  await context.prisma.deleteInvite({
    id: args.id
  });
  return true;
}

async function declineInvite(parent, args, context) {
  await context.prisma.updateInvite({
    data: {
      status: 'declined'
    },
    where: {
      id: args.id
    }
  });
  return true;
}

module.exports = {
  updateInvite,
  createInvite,
  removeInvite,
  declineInvite
};