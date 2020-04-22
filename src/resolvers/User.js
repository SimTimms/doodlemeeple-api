function sections(parent, args, context) {
  return context.prisma.user({ id: parent.id }).sections();
}

function notifications(parent, args, context) {
  return context.prisma.user({ id: parent.id }).notifications();
}

function games(parent, args, context) {
  return context.prisma.user({ id: parent.id }).games();
}

module.exports = {
  sections,
  notifications,
  games,
};
