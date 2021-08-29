import { WebshopTC } from '../models';

const WebshopQuery = {
  webshopById: WebshopTC.getResolver('findById'),
  webshopByIds: WebshopTC.getResolver('findByIds'),
  webshopOne: WebshopTC.getResolver('findOne'),
  webshopMany: WebshopTC.getResolver('findMany'),
  webshopsByUser: WebshopTC.getResolver('webshopsByUser'),
  webshopCount: WebshopTC.getResolver('count'),
  webshopConnection: WebshopTC.getResolver('connection'),
  webshopPagination: WebshopTC.getResolver('pagination'),
};

const WebshopMutation = {
  webshopCreateOne: WebshopTC.getResolver('createOne'),
  webshopCreateMany: WebshopTC.getResolver('createMany'),
  webshopUpdateById: WebshopTC.getResolver('updateById'),
  webshopUpdateOne: WebshopTC.getResolver('updateOne'),
  webshopUpdateMany: WebshopTC.getResolver('updateMany'),
  webshopRemoveById: WebshopTC.getResolver('removeById'),
  webshopRemoveOne: WebshopTC.getResolver('removeOne'),
  webshopRemoveMany: WebshopTC.getResolver('removeMany'),
};

export { WebshopQuery, WebshopMutation };
