import { log } from '@helper/logger';
import * as mongoose from 'mongoose';
import * as dot from 'dotenv';

dot.config();

let dbConnection;
const connect = new Promise(function (resolve, reject) {
  if (dbConnection) {
    return dbConnection;
  } else {
    // @ts-ignore
    dbConnection = mongoose.connect(process.env.MONGO_URL);
    dbConnection.on('error', (error) => {
      log(error);
      reject(error);
    });
    dbConnection.on('open', () => {
      log('Connect to db success');
      resolve(dbConnection);
    });
  }
});
export default connect;
