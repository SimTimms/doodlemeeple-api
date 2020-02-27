function sections(parent, args, context) {
  return context.prisma.user({ id: parent.id }).sections();
}

function notifications(parent, args, context) {
  return context.prisma.user({ id: parent.id }).notifications();
}

module.exports = {
  sections,
  notifications,
};
