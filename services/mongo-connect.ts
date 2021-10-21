import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import * as mongoose from 'mongoose';


let dbConnection;

async function connect() {
  return new Promise(function (resolve, reject) {
    if (dbConnection) {
      return dbConnection;
    } else {
      // @ts-ignore
      mongoose.connect(getEnv('MONGO_URL'));
      const dbConnection = mongoose.connection;
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
}

export default connect;
