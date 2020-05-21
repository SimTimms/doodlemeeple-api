function sections(parent, args, context) {
  return context.prisma.user({ id: parent.id }).sections();
}

function notifications(parent, args, context) {
  return context.prisma.user({ id: parent.id }).notifications();
}

function games(parent, args, context) {
  return context.prisma.user({ id: parent.id }).games();
}

function invites(parent, args, context) {
  return context.prisma.user({ id: parent.id }).invites();
}

function invitesReceived(parent, args, context) {
  return context.prisma.user({ id: parent.id }).invitesReceived();
}

function conversations(parent, args, context) {
  return context.prisma.user({ id: parent.id }).conversations();
}
module.exports = {
  sections,
  notifications,
  games,
  invites,
  invitesReceived,
  conversations,
};
