import { getEnv } from '@helper/environment';
import { userModel } from '@models/MongoDB/UsersSchema';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { UserAuthData, UserPresenceInDbInterface } from './auth.inteface';
export class AuthService {
  createNewUser = (authData) => {
    const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
    const hashPass = crypto.createHash('sha256').update(userPasswordFromQuery).digest('hex');
    const newUser = new userModel({
      _id: new mongoose.mongo.ObjectId(),
      email: userEmailFromQuery,
      password: hashPass,
    });

    return newUser;
  };
  async checkUserInDb(authData: UserAuthData): Promise<boolean> {
    const userEmailFromQuery = authData.email;
    const userPresenceInDb: boolean = await userModel.findOne({ email: userEmailFromQuery });

    return userPresenceInDb;
  }

  addUserInDb(newUser): void {
    newUser.save(function (err, DbResult) {
      if (err) {
        throw err;
      }
    });
  }
  async getUserIdFromToken(event: APIGatewayTokenAuthorizerEvent): Promise<string> {
    const tokenKey = getEnv('TOKEN_KEY');
    let userIdFromToken;
    const bearerHeader = event.authorizationToken;

    if (event.authorizationToken) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, tokenKey, function (err, decoded) {
        userIdFromToken = decoded.id;
      });
    }

    return userIdFromToken;
  }
  async checkAuthData(authData: UserAuthData): Promise<UserPresenceInDbInterface> {
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

  generatePolicy<C extends APIGatewayAuthorizerResult['context']>(
    principalId: string,
    effect: 'Allow' | 'Deny',
    resource: string,
    context: C
  ): APIGatewayAuthorizerResult & { context: C } {
    const authResponse: APIGatewayAuthorizerResult & { context: C } = {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
          },
        ],
      },
      context,
    };

    return authResponse;
  }
}
