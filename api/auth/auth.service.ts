import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { getEnv } from '@helper/environment';
import { dynamoClient } from '@services/dynamo-connect';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { UserAuthData, UserPresenceInDb } from './auth.inteface';
import { log } from '@helper/logger';

const UNAUTHORIZED = new Error('Unauthorized');

export class AuthService {
  createNewUser = (authData: UserAuthData) => {
    const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
    const hashPass = crypto.createHmac('sha256', getEnv('SALT')).update(userPasswordFromQuery).digest('hex');

    const newUser = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Item: {
        email: { S: userEmailFromQuery },
        Hash: { S: hashPass },
      },
    };
    log('New user success created');
    return newUser;
  };

  async checkUserInDb(authData: UserAuthData): Promise<any> {
    const userEmailFromQuery = authData.email;
    const hashPass = crypto.createHmac('sha256', getEnv('SALT')).update(authData.password).digest('hex');

    const params = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: {
        email: { S: userEmailFromQuery },
        Hash: { S: hashPass },
      },
    };
    const userPresenceInDb = await dynamoClient.send(new GetItemCommand(params));
    log('check Item' + JSON.stringify(userPresenceInDb.Item));
    return userPresenceInDb.Item;
  }

  addUserInDb(newUser): void {
    log('user in function addUserInDb ' + JSON.stringify(newUser));
    const result = dynamoClient.send(new PutItemCommand(newUser));
    log('result of adding a new user = ' + result);
  }

  async getUserIdFromTokenForAuthorizer(event: APIGatewayTokenAuthorizerEvent): Promise<string> {
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

  async checkAuthData(authData: UserAuthData): Promise<UserPresenceInDb> {
    const tokenKey = getEnv('TOKEN_KEY');

    const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
    const hashPass = crypto.createHmac('sha256', getEnv('SALT')).update(userPasswordFromQuery).digest('hex');
    let userPresenceInDb;
    const params = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: {
        email: { S: userEmailFromQuery },
        Hash: { S: hashPass },
      },
    };
    userPresenceInDb = await dynamoClient.send(new GetItemCommand(params));
    log(userPresenceInDb);
    /*
     * If user presence in db check password
     */
    if (userPresenceInDb.Item) {
      if (userPresenceInDb.Item.Hash.S === hashPass) {
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
    log('checkAuthResult return ' + Boolean(userPresenceInDb));
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
