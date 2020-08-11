import { SchemaComposer } from 'graphql-compose';

const schemaComposer = new SchemaComposer();

import { UserQuery, UserMutation } from './user';
import { SectionQuery, SectionMutation } from './section';
import { NotificationQuery, NotificationMutation } from './notification';
import { GalleryQuery, GalleryMutation } from './gallery';
import { ImageQuery, ImageMutation } from './image';
import { NotableProjectQuery, NotableProjectMutation } from './notableProject';
import { TestimonialQuery, TestimonialMutation } from './testimonial';
import { GameQuery, GameMutation } from './game';
import { JobQuery, JobMutation } from './job';
import { InviteQuery, InviteMutation } from './invite';
import { FavouriteQuery, FavouriteMutation } from './favourite';
import { MessageQuery, MessageMutation } from './message';
import { ContractQuery, ContractMutation } from './contract';
import { CountQuery } from './count';

schemaComposer.Query.addFields({
  ...UserQuery,
  ...SectionQuery,
  ...NotificationQuery,
  ...CountQuery,
  ...GalleryQuery,
  ...GalleryMutation,
  ...NotableProjectQuery,
  ...TestimonialQuery,
  ...GameQuery,
  ...JobQuery,
  ...InviteQuery,
  ...FavouriteQuery,
  ...MessageQuery,
  ...ContractQuery,
});

schemaComposer.Mutation.addFields({
  ...UserMutation,
  ...SectionMutation,
  ...NotificationMutation,
  ...ImageQuery,
  ...ImageMutation,
  ...NotableProjectMutation,
  ...TestimonialMutation,
  ...GameMutation,
  ...JobMutation,
  ...InviteMutation,
  ...FavouriteMutation,
  ...MessageMutation,
  ...ContractMutation,
});

export default schemaComposer.buildSchema();
