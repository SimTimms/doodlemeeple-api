import { Section, SectionTC } from '../models';

const SectionQuery = {
    sectionById: SectionTC.getResolver('findById'),
    sectionByIds: SectionTC.getResolver('findByIds'),
    sectionOne: SectionTC.getResolver('findOne'),
    sectionMany: SectionTC.getResolver('findMany'),
    sectionCount: SectionTC.getResolver('count'),
    sectionConnection: SectionTC.getResolver('connection'),
    sectionPagination: SectionTC.getResolver('pagination'),
};

const SectionMutation = {
    sectionCreateOne: SectionTC.getResolver('createOne'),
    sectionCreateMany: SectionTC.getResolver('createMany'),
    sectionUpdateById: SectionTC.getResolver('updateById'),
    sectionUpdateOne: SectionTC.getResolver('updateOne'),
    sectionUpdateMany: SectionTC.getResolver('updateMany'),
    sectionRemoveById: SectionTC.getResolver('removeById'),
    sectionRemoveOne: SectionTC.getResolver('removeOne'),
    sectionRemoveMany: SectionTC.getResolver('removeMany'),
};

export { SectionQuery, SectionMutation };
