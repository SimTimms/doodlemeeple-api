import { CountTC } from '../models';

const CountQuery = {
  counts: CountTC.getResolver('counts'),
};

export { CountQuery };
