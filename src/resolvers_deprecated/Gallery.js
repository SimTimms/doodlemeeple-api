async function section(parent, args, context) {
  return context.prisma.gallery({ id: parent.id }).section();
}

async function images(parent, args, context) {
  return context.prisma.gallery({ id: parent.id }).images();
}

module.exports = {
  section,
  images,
};
