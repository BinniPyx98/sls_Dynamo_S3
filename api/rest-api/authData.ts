//import { logger } from '@helper/logger';
import { getEnv } from '@helper/environment';
import { userModel } from '@models/MongoDB/UsersSchema';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export async function checkAuthData(authData) {
  const tokenKey = getEnv('TOKEN_KEY');

  const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
  let userPresenceInDb;

  userPresenceInDb = await userModel.findOne({ email: userEmailFromQuery });
  const userId = userPresenceInDb._id;
  /*
   * If user presence in db check password
   */
  const hashPass = crypto.createHash('sha256').update(userPasswordFromQuery).digest('hex');

  if (userPresenceInDb) {
    if (userPresenceInDb.password === hashPass) {
      console.log('successful authorization');
      userPresenceInDb = {
        error: false,
        data: {
          token: jwt.sign({ id: userId }, tokenKey),
        },
      };
    }
  } else {
    userPresenceInDb = { error: true, data: { errorMessage: 'authorization error' } };
  }

  return userPresenceInDb;
}
