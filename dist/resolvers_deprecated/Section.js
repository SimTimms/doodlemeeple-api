"use strict";

async function gallery(parent, args, context) {
  return await context.prisma.section({
    id: parent.id
  }).gallery();
}

async function testimonials(parent, args, context) {
  return await context.prisma.section({
    id: parent.id
  }).testimonials();
}

async function notableProjects(parent, args, context) {
  return await context.prisma.section({
    id: parent.id
  }).notableProjects();
}

async function user(parent, args, context) {
  return await context.prisma.user({
    id: parent.id
  }).user();
}

module.exports = {
  gallery,
  testimonials,
  notableProjects,
  user
};