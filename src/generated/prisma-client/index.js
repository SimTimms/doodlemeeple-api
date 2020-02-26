"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Link",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Notification",
    embedded: false
  },
  {
    name: "Section",
    embedded: false
  },
  {
    name: "Gallery",
    embedded: false
  },
  {
    name: "Vote",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://eu1.prisma.sh/tim-simms-97eabd/doodlemeeple-api/dev`
});
exports.prisma = new exports.Prisma();
