import { SchemaComposer } from 'graphql-compose';

const schemaComposer = new SchemaComposer();

import { UserQuery, UserMutation } from './user';
import { SectionQuery, SectionMutation } from './section';
import { NotificationQuery, NotificationMutation } from './notification';

schemaComposer.Query.addFields({
  ...UserQuery,
  ...SectionQuery,
  ...NotificationQuery,
});

schemaComposer.Mutation.addFields({
  ...UserMutation,
  ...SectionMutation,
  ...NotificationMutation,
});

export default schemaComposer.buildSchema();
