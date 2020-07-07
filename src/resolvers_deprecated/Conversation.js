function messages(parent, args, context, info) {
  return context.prisma.conversation({ id: parent.id }).messages({
    orderBy: 'createdAt_DESC',
    skip: info.variableValues.page * 10 - 10,
    first: info.variableValues.page * 10,
  });
}

async function unreadMessages(parent, args, context, info) {
  const count = await context.prisma.conversation({ id: parent.id }).messages(
    { where: { status: 'unread' } },
    {
      first: 10,
    },
  );

  return count.length;
}

async function participants(parent, args, context) {
  return await context.prisma.conversation({ id: parent.id }).participants();
}

function job(parent, args, context) {
  return context.prisma.conversation({ id: parent.id }).job();
}

module.exports = {
  messages,
  participants,
  job,
  unreadMessages,
};
