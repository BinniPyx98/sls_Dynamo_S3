import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { dynamoClient } from '@services/dynamo-connect';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { UserAuthData, UserPresenceInDbInterface } from './auth.inteface';
import { log } from '@helper/logger';

const UNAUTHORIZED = new Error('Unauthorized');

export class AuthService {
  createNewUser = (authData) => {
    const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
    const hashPass = crypto.createHmac('sha256', getEnv('SALT')).update(userPasswordFromQuery).digest('hex');

    const newUser = {
      TableName: 'Gallery',
      Item: {
        email: { S: userEmailFromQuery },
        password: { S: hashPass },
      },
    };
    return newUser;
  };

  async checkUserInDb(authData: UserAuthData): Promise<any> {
    const userEmailFromQuery = authData.email;
    const params = {
      TableName: 'Gallery',
      Key: {
        email: { S: userEmailFromQuery },
      },
    };
    const userPresenceInDb = await dynamoClient.send(new GetItemCommand(params));
    log('check Item' + JSON.stringify(userPresenceInDb.Item));
    return userPresenceInDb.Item;
  }

  addUserInDb(newUser): void {
    dynamoClient.send(new PutItemCommand(newUser));
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
    const params = {
      TableName: 'Gallery',
      Key: {
        email: { S: userEmailFromQuery },
      },
    };
    userPresenceInDb = await dynamoClient.send(new GetItemCommand(params));
    /*
     * If user presence in db check password
     */
    const hashPass = crypto.createHmac('sha256', getEnv('SALT')).update(userPasswordFromQuery).digest('hex');
    if (userPresenceInDb.Item) {
      if (userPresenceInDb.Item.password.S === hashPass) {
        const userEmail = userPresenceInDb.Item!.email.S;
        console.log('successful authorization');
        userPresenceInDb = {
          error: false,
          data: {
            token: jwt.sign({ id: userEmail }, tokenKey),
          },
        };
      } else {
        throw UNAUTHORIZED;
      }
    } else {
      throw UNAUTHORIZED;
    }
    log('service.checkAuthData return=' + JSON.stringify(userPresenceInDb));
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
    log('service.generatePolicy return access ' + authResponse.policyDocument.Statement[0].Effect);
    return authResponse;
  }
}
