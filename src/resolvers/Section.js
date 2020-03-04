async function gallery(parent, args, context) {
  return await context.prisma.section({ id: parent.id }).gallery();
}

async function testimonials(parent, args, context) {
  return await context.prisma.section({ id: parent.id }).testimonials();
}

async function notableProjects(parent, args, context) {
  return await context.prisma.section({ id: parent.id }).notableProjects();
}

module.exports = {
  gallery,
  testimonials,
  notableProjects,
};
