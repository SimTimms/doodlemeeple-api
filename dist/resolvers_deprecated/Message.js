"use strict";

async function sender(parent, args, context) {
  return await context.prisma.message({
    id: parent.id
  }).sender();
}

async function receiver(parent, args, context) {
  return await context.prisma.message({
    id: parent.id
  }).receiver();
}

async function job(parent, args, context) {
  return await context.prisma.message({
    id: parent.id
  }).job();
}

module.exports = {
  sender,
  receiver,
  job
};