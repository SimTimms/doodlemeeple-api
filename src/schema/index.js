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
import { MessageQuery, MessageMutation, MessageSubscription } from './message';
import { ContractQuery, ContractMutation } from './contract';
import { PaymentQuery, PaymentMutation } from './payment';
import { PaymentTermsQuery, PaymentTermsMutation } from './paymentTerms';
import { KickstarterQuery, KickstarterMutation } from './kickstarter';
import { MyPostQuery, MyPostMutation } from './myPost';
import { ActivityLogQuery, ActivityLogMutation } from './activityLog';
import { CountQuery } from './count';

schemaComposer.Query.addFields({
  ...ActivityLogQuery,
  ...MyPostQuery,
  ...KickstarterQuery,
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
  ...PaymentQuery,
  ...PaymentTermsQuery,
  ...ImageQuery,
});

schemaComposer.Mutation.addFields({
  ...ActivityLogMutation,
  ...MyPostMutation,
  ...KickstarterMutation,
  ...UserMutation,
  ...SectionMutation,
  ...NotificationMutation,
  ...ImageMutation,
  ...NotableProjectMutation,
  ...TestimonialMutation,
  ...GameMutation,
  ...JobMutation,
  ...InviteMutation,
  ...FavouriteMutation,
  ...MessageMutation,
  ...ContractMutation,
  ...PaymentMutation,
  ...PaymentTermsMutation,
});

schemaComposer.Subscription.addFields({
  ...MessageSubscription,
});

export default schemaComposer.buildSchema();
