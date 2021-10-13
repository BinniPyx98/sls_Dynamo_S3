import { log } from '@helper/logger';
import * as mongoose from 'mongoose';
import { getEnv } from '@helper/environment';

mongoose.connect(getEnv('MONGO_URL'));

const checkConnect = mongoose.connection;

checkConnect.on('error', (error) => {
  log(error);
});
checkConnect.on('open', () => {
  log('Connect to db success');
});
export { checkConnect };
