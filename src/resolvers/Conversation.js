function messages(parent, args, context, info) {
  return context.prisma.conversation({ id: parent.id }).messages({
    orderBy: 'createdAt_DESC',
    skip: info.variableValues.page * 10 - 10,
    first: info.variableValues.page * 10,
  });
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
};
