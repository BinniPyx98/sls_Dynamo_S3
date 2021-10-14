import { log } from '@helper/logger';
import * as mongoose from 'mongoose';
import * as dot from 'dotenv';

dot.config();
// @ts-ignore
mongoose.connect(process.env.MONGO_URL);
const checkConnect = mongoose.connection;

checkConnect.on('error', (error) => {
  log(error);
});
checkConnect.on('open', () => {
  log('Connect to db success');
});

export { checkConnect };
