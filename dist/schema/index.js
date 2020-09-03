"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphqlCompose = require("graphql-compose");

var _user = require("./user");

var _section = require("./section");

var _notification = require("./notification");

var _gallery = require("./gallery");

var _image = require("./image");

var _notableProject = require("./notableProject");

var _testimonial = require("./testimonial");

var _game = require("./game");

var _job = require("./job");

var _invite = require("./invite");

var _favourite = require("./favourite");

var _message = require("./message");

var _contract = require("./contract");

var _payment = require("./payment");

var _paymentTerms = require("./paymentTerms");

var _count = require("./count");

const schemaComposer = new _graphqlCompose.SchemaComposer();
schemaComposer.Query.addFields({ ..._user.UserQuery,
  ..._section.SectionQuery,
  ..._notification.NotificationQuery,
  ..._count.CountQuery,
  ..._gallery.GalleryQuery,
  ..._gallery.GalleryMutation,
  ..._notableProject.NotableProjectQuery,
  ..._testimonial.TestimonialQuery,
  ..._game.GameQuery,
  ..._job.JobQuery,
  ..._invite.InviteQuery,
  ..._favourite.FavouriteQuery,
  ..._message.MessageQuery,
  ..._contract.ContractQuery,
  ..._payment.PaymentQuery,
  ..._paymentTerms.PaymentTermsQuery
});
schemaComposer.Mutation.addFields({ ..._user.UserMutation,
  ..._section.SectionMutation,
  ..._notification.NotificationMutation,
  ..._image.ImageQuery,
  ..._image.ImageMutation,
  ..._notableProject.NotableProjectMutation,
  ..._testimonial.TestimonialMutation,
  ..._game.GameMutation,
  ..._job.JobMutation,
  ..._invite.InviteMutation,
  ..._favourite.FavouriteMutation,
  ..._message.MessageMutation,
  ..._contract.ContractMutation,
  ..._payment.PaymentMutation,
  ..._paymentTerms.PaymentTermsMutation
});

var _default = schemaComposer.buildSchema();

exports.default = _default;