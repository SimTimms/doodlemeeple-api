async function user(parent, args, context) {
  return await context.prisma.game({ id: parent.id }).user();
}

async function jobs(parent, args, context) {
  return await context.prisma.game({ id: parent.id }).jobs();
}

module.exports = {
  user,
  jobs,
};
