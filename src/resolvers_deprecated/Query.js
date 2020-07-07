const { getUserId } = require('../utils');

async function getSections(parent, args, context) {
  const userId = getUserId(context);
  const sections = await context.prisma.sections({
    where: {
      user: {
        id: userId,
      },
    },
  });
  return sections;
}

async function getGalleries(parent, args, context) {
  const sections = await context.prisma.galleries({
    where: {
      section: {
        id_in: args.sectionId,
      },
    },
  });

  return sections;
}

async function getImages(parent, args, context) {
  const sections = await context.prisma.galleryImages({
    where: {
      gallery: {
        id_in: args.galleryId,
      },
    },
  });
  return sections;
}

async function sectionsPreview(parent, args, context) {
  const userId = args.userId;
  const sections = await context.prisma.sections({
    where: {
      user: {
        id: userId,
      },
    },
  });
  return sections;
}
async function profile(parent, args, context, info) {
  const userId = getUserId(context);

  const profile = await context.prisma.user({
    id: userId,
  });

  return profile;
}

async function getGame(parent, args, context, info) {
  const game = await context.prisma.game({
    id: args.gameId,
  });

  return game;
}

async function getGames(parent, args, context, info) {
  const userId = getUserId(context);
  const games = await context.prisma.games({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return games;
}

async function getJob(parent, args, context, info) {
  const job = await context.prisma.job({
    id: args.jobId,
  });

  return job;
}

async function previewContract(parent, args, context, info) {
  const contract = await context.prisma.contract({
    id: args.contractId,
  });

  return contract;
}

async function getContract(parent, args, context, info) {
  const userId = getUserId(context);

  const contract = await context.prisma.contracts({
    where: {
      job: {
        id: args.jobId,
      },
      user: { id: userId },
    },
  });

  return contract;
}

async function getContractId(parent, args, context, info) {
  const userId = getUserId(context);

  const contract = await context.prisma.contracts({
    where: {
      id: args.contractId,

      user: { id: userId },
    },
  });

  return contract;
}

async function getPaymentTerms(parent, args, context, info) {
  const userId = getUserId(context);

  const contract = await context.prisma.paymentTerms({
    where: {
      contract: {
        id: args.contractId,
      },
    },
  });

  return contract;
}

async function getJobs(parent, args, context, info) {
  const userId = getUserId(context);
  const games = await context.prisma.jobs({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return games;
}

async function getConversations(parent, args, context, info) {
  const userId = getUserId(context);
  const conversations = await context.prisma.conversations({
    where: {
      participants_some: { id_in: [userId] },
      job: {
        invite_some: {
          status: args.status,
          OR: [{ receiver: { id: userId } }, { user: { id: userId } }],
        },
      },
    },
  });

  return conversations;
}

async function getConversation(parent, args, context, info) {
  const conversationId = args.conversationId;

  const conversation = await context.prisma.conversation({
    id: conversationId,
  });

  return conversation;
}

async function getMessages(parent, args, context, info) {
  const userId = getUserId(context);
  const messages = await context.prisma.messages({
    where: {
      OR: [
        {
          sender: {
            id: userId,
          },
        },
        { receiver: { id: userId } },
      ],
      job: { id: args.jobId },
    },
  });

  return messages;
}

async function profilePreview(parent, args, context, info) {
  const userId = args.userId;

  const profile = await context.prisma.user({
    id: userId,
  });

  return profile;
}

async function getTestimonials(parent, args, context) {
  const section = await context.prisma.sections({
    where: {
      id: args.sectionId,
    },
  });

  return section;
}

async function getCreatives(parent, args, context) {
  const userId = getUserId(context);
  const users = await context.prisma.users({ where: { id_not: userId } });

  return users;
}

async function getInvites(parent, args, context) {
  const userId = getUserId(context);
  const invites = await context.prisma.invites({
    where: {
      receiver: { id: userId },
      status: 'submitted',
    },
  });

  return invites;
}

async function determineConversationId(parent, { jobId, userId }, context) {
  const thisUserId = getUserId(context);
  const conversation = await context.prisma.conversations({
    where: {
      job: { id: jobId },
      participants_every: { id_in: [userId, thisUserId] },
    },
  });

  console.log(conversation);

  if (conversation.length === 0) {
    const conversationNew = await context.prisma.createConversation({
      participants: {
        connect: [{ id: thisUserId }, { id: userId }],
      },
      job: { connect: { id: jobId } },
    });
    return conversationNew.id;
  }

  return conversation[0].id;
}

async function counts(parent, args, context) {
  const userId = getUserId(context);
  const invites = await context.prisma.invites({
    where: {
      receiver: { id: userId },
      status: 'submitted',
    },
  });

  const messages = await context.prisma.messages({
    where: {
      status: 'unread',
      conversation: { participants_some: { id: userId } },
      sender: { id_not: userId },
    },
  });

  return {
    invites: invites.length,
    id: 'counts',
    messages: messages.length,
  };
}

async function getNotifications(parent, args, context) {
  const userId = getUserId(context);

  const notifications = await context.prisma.notifications({
    orderBy: 'createdAt_DESC',
    where: {
      user: {
        id: userId,
      },
    },
    skip: 0,
    first: 5,
  });

  return notifications;
}

module.exports = {
  profile,
  getNotifications,
  getSections,
  getGalleries,
  getImages,
  getTestimonials,
  profilePreview,
  getGame,
  getGames,
  getJob,
  getJobs,
  sectionsPreview,
  getCreatives,
  getInvites,
  determineConversationId,
  counts,
  getMessages,
  getConversations,
  getConversation,
  getContract,
  getContractId,
  getPaymentTerms,
  previewContract,
};
