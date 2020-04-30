async function user(parent, args, context) {
  return await context.prisma.game({ id: parent.id }).user();
}

module.exports = {
  user,
};
