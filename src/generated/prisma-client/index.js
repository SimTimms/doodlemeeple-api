"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Notification",
    embedded: false
  },
  {
    name: "NotableProjects",
    embedded: false
  },
  {
    name: "Section",
    embedded: false
  },
  {
    name: "Testimonial",
    embedded: false
  },
  {
    name: "Gallery",
    embedded: false
  },
  {
    name: "GalleryImage",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://aaamj-e728e3b62f.herokuapp.com/default/default`
});
exports.prisma = new exports.Prisma();
