"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var prisma_lib_1 = require("prisma-client-lib");

var typeDefs = require("./prisma-schema").typeDefs;

var models = [{
  name: "User",
  embedded: false
}, {
  name: "Payment",
  embedded: false
}, {
  name: "Contract",
  embedded: false
}, {
  name: "PaymentTerm",
  embedded: false
}, {
  name: "Invite",
  embedded: false
}, {
  name: "Conversation",
  embedded: false
}, {
  name: "Job",
  embedded: false
}, {
  name: "Message",
  embedded: false
}, {
  name: "Notification",
  embedded: false
}, {
  name: "Game",
  embedded: false
}, {
  name: "Count",
  embedded: false
}, {
  name: "NotableProjects",
  embedded: false
}, {
  name: "Section",
  embedded: false
}, {
  name: "Testimonial",
  embedded: false
}, {
  name: "Gallery",
  embedded: false
}, {
  name: "GalleryImage",
  embedded: false
}];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://doodlemeeple-e3b23964c7.herokuapp.com`
});
exports.prisma = new exports.Prisma();